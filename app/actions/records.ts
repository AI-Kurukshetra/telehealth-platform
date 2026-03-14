"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { getCurrentUserContext } from "@/lib/data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { medicalRecordSchema } from "@/lib/validators";

type RecordState = {
  error: string;
  success: boolean;
  data?: {
    appointmentId: string;
    patientId: string;
    diagnosis: string;
    prescription: string;
    clinicalNotes: string;
  };
};

export async function createMedicalRecordAction(
  _: RecordState,
  formData: FormData
): Promise<RecordState> {
  await requireRole("doctor");

  const parsed = medicalRecordSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    patientId: formData.get("patientId"),
    diagnosis: formData.get("diagnosis"),
    prescription: formData.get("prescription"),
    clinicalNotes: formData.get("clinicalNotes")
  });

  if (!parsed.success) {
    return {
      error: "Complete the diagnosis, prescription, and clinical notes.",
      success: false
    };
  }

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    return {
      error: "Doctor profile not found.",
      success: false
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id")
    .eq("id", parsed.data.appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return {
      error: appointmentError?.message ?? "Appointment not found.",
      success: false
    };
  }

  if (appointment.doctor_id !== doctorProfile.id) {
    return {
      error: "You cannot create records for another doctor's appointment.",
      success: false
    };
  }

  if (appointment.patient_id !== parsed.data.patientId) {
    return {
      error: "Patient selection does not match the appointment.",
      success: false
    };
  }

  const { error: recordError } = await supabase
    .from("medical_records")
    .upsert(
      {
        appointment_id: parsed.data.appointmentId,
        doctor_id: doctorProfile.id,
        patient_id: parsed.data.patientId,
        diagnosis: parsed.data.diagnosis,
        prescription: parsed.data.prescription,
        clinical_notes: parsed.data.clinicalNotes
      },
      {
        onConflict: "appointment_id"
      }
    );

  if (recordError) {
    return {
      error: recordError.message,
      success: false
    };
  }

  const { error: appointmentUpdateError } = await supabase
    .from("appointments")
    .update({
      status: "completed"
    })
    .eq("id", parsed.data.appointmentId);

  if (appointmentUpdateError) {
    return {
      error: appointmentUpdateError.message,
      success: false
    };
  }

  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/patient-records");
  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/records");

  return { error: "", success: true, data: parsed.data };
}
