"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { analyzeVisitPreparationWithLlm } from "@/lib/ai";
import { getCurrentUserContext } from "@/lib/data";
import type { VisitPreparation } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { visitPrepSchema } from "@/lib/validators";

type VisitPrepState = {
  error: string;
  success: boolean;
  preparation?: VisitPreparation;
};

export async function saveVisitPreparationAction(
  _: VisitPrepState,
  formData: FormData
): Promise<VisitPrepState> {
  await requireRole("patient");

  const parsed = visitPrepSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    symptoms: formData.get("symptoms"),
    symptomDuration: formData.get("symptomDuration"),
    currentMedications: formData.get("currentMedications"),
    allergies: formData.get("allergies"),
    medicalHistory: formData.get("medicalHistory"),
    visitGoals: formData.get("visitGoals")
  });

  if (!parsed.success) {
    return {
      error: "Complete the main symptoms and visit goals before saving your intake.",
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
    .select("id, doctor_id, patient_id, status")
    .eq("id", parsed.data.appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return {
      error: appointmentError?.message ?? "Appointment not found.",
      success: false
    };
  }

  if (appointment.patient_id !== patientProfile.id) {
    return {
      error: "You can only prepare for your own appointments.",
      success: false
    };
  }

  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return {
      error: "Visit prep can only be updated for active appointments.",
      success: false
    };
  }

  try {
    const analysis = await analyzeVisitPreparationWithLlm({
      symptoms: parsed.data.symptoms,
      symptomDuration: parsed.data.symptomDuration || undefined,
      currentMedications: parsed.data.currentMedications || undefined,
      allergies: parsed.data.allergies || undefined,
      medicalHistory: parsed.data.medicalHistory || undefined,
      visitGoals: parsed.data.visitGoals
    });

    const payload = {
      appointment_id: appointment.id,
      patient_id: patientProfile.id,
      doctor_id: appointment.doctor_id,
      symptoms: parsed.data.symptoms,
      symptom_duration: parsed.data.symptomDuration || null,
      current_medications: parsed.data.currentMedications || null,
      allergies: parsed.data.allergies || null,
      medical_history: parsed.data.medicalHistory || null,
      visit_goals: parsed.data.visitGoals,
      ai_summary: analysis
    };

    const { data: preparation, error: saveError } = await supabase
      .from("visit_preparations")
      .upsert(payload, {
        onConflict: "appointment_id"
      })
      .select(
        "id, appointment_id, doctor_id, patient_id, symptoms, symptom_duration, current_medications, allergies, medical_history, visit_goals, ai_summary, created_at, updated_at"
      )
      .single();

    if (saveError || !preparation) {
      return {
        error: saveError?.message ?? "Unable to save visit prep.",
        success: false
      };
    }

    revalidatePath("/patient/appointments");
    revalidatePath("/patient/dashboard");
    revalidatePath("/doctor/appointments");
    revalidatePath("/doctor/dashboard");

    return {
      error: "",
      success: true,
      preparation: preparation as VisitPreparation
    };
  } catch {
    return {
      error: "The AI visit prep service is temporarily unavailable. Please try again.",
      success: false
    };
  }
}
