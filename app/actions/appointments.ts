"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { requireRole } from "@/lib/auth";
import { analyzeVisitPreparationWithLlm } from "@/lib/ai";
import { getCurrentUserContext } from "@/lib/data";
import { getWeekdayFromDate, createVideoRoomId } from "@/lib/helpers";
import { createCheckoutSessionForAppointment } from "@/lib/payments";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  availabilitySchema,
  bookingSchema,
  bookingVisitPrepSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema
} from "@/lib/validators";

type BookingState = {
  error: string;
  success: boolean;
  videoRoomId: string;
  paymentStatus: string;
};

type AppointmentMutationState = {
  error: string;
  success: boolean;
};

type AvailabilityState = {
  error: string;
  success: boolean;
  savedCount: number;
};

function mapAppointmentError(message: string) {
  if (message.includes("duplicate key value")) {
    return "That time slot has already been booked. Please choose another slot.";
  }

  if (message.includes("unavailable")) {
    return "The selected doctor is unavailable for that time slot.";
  }

  if (message.includes("past")) {
    return "Appointments must be scheduled for today or a future date.";
  }

  return message;
}

function mapVisitPrepValidationError(error: ZodError) {
  const issue = error.issues[0];

  if (!issue) {
    return "Complete the pre-visit details or continue without the AI intake section.";
  }

  switch (issue.path[0]) {
    case "symptoms":
      return "Describe the symptoms in a little more detail before saving AI visit prep.";
    case "symptomDuration":
      return "Keep the symptom duration summary a little shorter.";
    case "currentMedications":
      return "Shorten the medication list slightly so it can be saved.";
    case "allergies":
      return "Shorten the allergy summary slightly so it can be saved.";
    case "medicalHistory":
      return "Shorten the medical history summary slightly so it can be saved.";
    default:
      return "Complete the pre-visit details or continue without the AI intake section.";
  }
}

async function ensureDoctorAvailability(doctorId: string, date: string, timeSlot: string) {
  const supabase = await createServerSupabaseClient();
  const weekday = getWeekdayFromDate(date);

  const { data, error } = await supabase
    .from("doctor_availability")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("weekday", weekday)
    .eq("time_slot", timeSlot)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("The selected doctor is unavailable for that time slot.");
  }
}

function revalidateAppointmentSurfaces() {
  revalidatePath("/patient/book");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient/dashboard");
  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor/dashboard");
}

export async function bookAppointmentAction(
  _: BookingState,
  formData: FormData
): Promise<BookingState> {
  await requireRole("patient");

  const parsed = bookingSchema.safeParse({
    specialization: formData.get("specialization"),
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    timeSlot: formData.get("timeSlot")
  });
  const includeVisitPrep = formData.get("includeVisitPrep") === "true";
  const visitPrepParsed = includeVisitPrep
    ? bookingVisitPrepSchema.safeParse({
        includeVisitPrep: formData.get("includeVisitPrep"),
        symptoms: String(formData.get("symptoms") ?? ""),
        symptomDuration: String(formData.get("symptomDuration") ?? ""),
        currentMedications: String(formData.get("currentMedications") ?? ""),
        allergies: String(formData.get("allergies") ?? ""),
        medicalHistory: String(formData.get("medicalHistory") ?? ""),
        visitGoals: String(formData.get("visitGoals") ?? "")
      })
    : null;
  const defaultVisitGoals = "Clinical review and treatment guidance for the reported symptoms.";

  if (!parsed.success) {
    return {
      error: "Select a specialist, doctor, date, and time slot.",
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  if (visitPrepParsed && !visitPrepParsed.success) {
    return {
      error: mapVisitPrepValidationError(visitPrepParsed.error),
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    return {
      error: "Patient profile not found.",
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id, specialization, consultation_fee")
    .eq("id", parsed.data.doctorId)
    .single();

  if (doctorError || !doctor) {
    return {
      error: "Selected doctor could not be found.",
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  try {
    await ensureDoctorAvailability(
      parsed.data.doctorId,
      parsed.data.date,
      parsed.data.timeSlot
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Doctor availability could not be loaded.",
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  const videoRoomId = createVideoRoomId(
    parsed.data.doctorId,
    patientProfile.id,
    parsed.data.date,
    parsed.data.timeSlot
  );

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      doctor_id: parsed.data.doctorId,
      patient_id: patientProfile.id,
      appointment_date: parsed.data.date,
      time_slot: parsed.data.timeSlot,
      status: "scheduled",
      video_room_id: videoRoomId,
      payment_status: "pending",
      consultation_fee: doctor.consultation_fee
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    return {
      error: mapAppointmentError(appointmentError?.message ?? "Unable to create appointment."),
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      appointment_id: appointment.id,
      amount: doctor.consultation_fee,
      currency: "usd",
      status: "pending"
    });

  if (paymentError) {
    await supabase.from("appointments").delete().eq("id", appointment.id);

    return {
      error: paymentError.message,
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  if (visitPrepParsed?.success) {
    try {
      const analysis = await analyzeVisitPreparationWithLlm({
        symptoms: visitPrepParsed.data.symptoms,
        symptomDuration: visitPrepParsed.data.symptomDuration || undefined,
        currentMedications: visitPrepParsed.data.currentMedications || undefined,
        allergies: visitPrepParsed.data.allergies || undefined,
        medicalHistory: visitPrepParsed.data.medicalHistory || undefined,
        visitGoals: visitPrepParsed.data.visitGoals || defaultVisitGoals
      });

      await supabase.from("visit_preparations").upsert(
        {
          appointment_id: appointment.id,
          patient_id: patientProfile.id,
          doctor_id: parsed.data.doctorId,
          symptoms: visitPrepParsed.data.symptoms,
          symptom_duration: visitPrepParsed.data.symptomDuration || null,
          current_medications: visitPrepParsed.data.currentMedications || null,
          allergies: visitPrepParsed.data.allergies || null,
          medical_history: visitPrepParsed.data.medicalHistory || null,
          visit_goals: visitPrepParsed.data.visitGoals || defaultVisitGoals,
          ai_summary: analysis
        },
        {
          onConflict: "appointment_id"
        }
      );
    } catch {
      // Visit prep is additive. Booking and payment should still proceed if AI intake fails.
    }
  }

  revalidateAppointmentSurfaces();
  await createCheckoutSessionForAppointment(appointment.id);

  return {
    error: "",
    success: true,
    videoRoomId,
    paymentStatus: "pending"
  };
}

export async function rescheduleAppointmentAction(
  _: AppointmentMutationState,
  formData: FormData
): Promise<AppointmentMutationState> {
  await requireRole("patient");

  const parsed = rescheduleAppointmentSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    date: formData.get("date"),
    timeSlot: formData.get("timeSlot")
  });

  if (!parsed.success) {
    return {
      error: "Choose a new date and time slot before rescheduling.",
      success: false
    };
  }

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    return {
      error: "Patient profile not found.",
      success: false
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, status, payment_status")
    .eq("id", parsed.data.appointmentId)
    .eq("patient_id", patientProfile.id)
    .single();

  if (appointmentError || !appointment) {
    return {
      error: appointmentError?.message ?? "Appointment not found.",
      success: false
    };
  }

  if (appointment.status !== "scheduled") {
    return {
      error: "Only scheduled appointments can be rescheduled.",
      success: false
    };
  }

  try {
    await ensureDoctorAvailability(
      appointment.doctor_id,
      parsed.data.date,
      parsed.data.timeSlot
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Doctor availability could not be loaded.",
      success: false
    };
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      appointment_date: parsed.data.date,
      time_slot: parsed.data.timeSlot,
      video_room_id: createVideoRoomId(
        appointment.doctor_id,
        patientProfile.id,
        parsed.data.date,
        parsed.data.timeSlot
      )
    })
    .eq("id", parsed.data.appointmentId);

  if (updateError) {
    return {
      error: mapAppointmentError(updateError.message),
      success: false
    };
  }

  revalidateAppointmentSurfaces();

  return {
    error: "",
    success: true
  };
}

export async function cancelAppointmentAction(formData: FormData) {
  await requireRole("patient");

  const parsed = cancelAppointmentSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    reason: formData.get("reason")
  });

  if (!parsed.success) {
    throw new Error("A valid appointment and cancellation reason are required.");
  }

  const { user, patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_by_user_id: user.id,
      cancellation_reason: parsed.data.reason?.trim() || "Cancelled by patient"
    })
    .eq("id", parsed.data.appointmentId)
    .eq("patient_id", patientProfile.id);

  if (error) {
    throw new Error(mapAppointmentError(error.message));
  }

  revalidateAppointmentSurfaces();
  redirect("/patient/appointments");
}

export async function updateDoctorAvailabilityAction(
  _: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  await requireRole("doctor");

  const parsed = availabilitySchema.safeParse({
    slots: formData.getAll("slots").map(String)
  });

  if (!parsed.success) {
    return {
      error: "Availability could not be saved.",
      success: false,
      savedCount: 0
    };
  }

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    return {
      error: "Doctor profile not found.",
      success: false,
      savedCount: 0
    };
  }

  const availabilityRows = parsed.data.slots
    .map((value) => {
      const [weekdayValue, timeSlot] = value.split("|");
      const weekday = Number(weekdayValue);

      if (Number.isNaN(weekday) || !timeSlot) {
        return null;
      }

      return {
        doctor_id: doctorProfile.id,
        weekday,
        time_slot: timeSlot
      };
    })
    .filter(
      (
        row
      ): row is {
        doctor_id: string;
        weekday: number;
        time_slot: string;
      } => Boolean(row)
    );

  const supabase = await createServerSupabaseClient();
  const { error: deleteError } = await supabase
    .from("doctor_availability")
    .delete()
    .eq("doctor_id", doctorProfile.id);

  if (deleteError) {
    return {
      error: deleteError.message,
      success: false,
      savedCount: 0
    };
  }

  if (availabilityRows.length > 0) {
    const { error: insertError } = await supabase
      .from("doctor_availability")
      .insert(availabilityRows);

    if (insertError) {
      return {
        error: insertError.message,
        success: false,
        savedCount: 0
      };
    }
  }

  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor/dashboard");
  revalidatePath("/patient/book");

  return {
    error: "",
    success: true,
    savedCount: availabilityRows.length
  };
}

export async function joinConsultationAction(videoRoomId: string) {
  redirect(`https://meet.jit.si/${videoRoomId}`);
}

export async function startCheckoutAction(formData: FormData) {
  await requireRole("patient");

  const appointmentId = String(formData.get("appointmentId") ?? "");

  if (!appointmentId) {
    throw new Error("Appointment id is required.");
  }

  await createCheckoutSessionForAppointment(appointmentId);
}
