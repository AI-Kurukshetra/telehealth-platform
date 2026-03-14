"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCheckoutSessionForAppointment } from "@/lib/payments";
import { requireRole } from "@/lib/auth";
import { getCurrentUserContext } from "@/lib/data";
import { bookingSchema } from "@/lib/validators";
import { createVideoRoomId } from "@/lib/helpers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type BookingState = {
  error: string;
  success: boolean;
  videoRoomId: string;
  paymentStatus: string;
};

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

  if (!parsed.success) {
    return {
      error: "Select a specialist, doctor, date, and time slot.",
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

  const supabase = createAdminSupabaseClient();
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

  if (doctor.specialization !== parsed.data.specialization) {
    return {
      error: "The selected doctor does not match the chosen specialization.",
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  const { data: existingSlot, error: slotError } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", parsed.data.doctorId)
    .eq("appointment_date", parsed.data.date)
    .eq("time_slot", parsed.data.timeSlot)
    .maybeSingle();

  if (slotError) {
    return {
      error: slotError.message,
      success: false,
      videoRoomId: "",
      paymentStatus: ""
    };
  }

  if (existingSlot) {
    return {
      error: "That time slot has already been booked. Please choose another slot.",
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
      error: appointmentError?.message ?? "Unable to create appointment.",
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

  revalidatePath("/patient/book");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient/dashboard");
  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor/dashboard");

  await createCheckoutSessionForAppointment(appointment.id);

  return {
    error: "",
    success: true,
    videoRoomId,
    paymentStatus: "pending"
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
