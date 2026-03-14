"use server";

import { analyzeSymptomsWithLlm } from "@/lib/ai";
import { symptomSchema } from "@/lib/validators";

type SymptomState = {
  error: string;
  success: boolean;
  result?: {
    possibleConditions: string[];
    recommendedSpecialist: string;
    urgencyLevel: string;
    basicAdvice: string[];
  };
};

export async function analyzeSymptomsAction(
  _: SymptomState,
  formData: FormData
): Promise<SymptomState> {
  const parsed = symptomSchema.safeParse({
    symptoms: formData.get("symptoms")
  });

  if (!parsed.success) {
    return { error: "Describe symptoms in more detail.", success: false };
  }

  try {
    const result = await analyzeSymptomsWithLlm(parsed.data.symptoms);
    return { error: "", success: true, result };
  } catch {
    return {
      error: "AI analysis is temporarily unavailable. Please try again.",
      success: false
    };
  }
}
