import OpenAI from "openai";

import { getServerEnv } from "@/lib/env";
import { demoSymptomResponse } from "@/lib/demo-data";
import type { SymptomAnalysis, VisitPrepAnalysis } from "@/lib/types";

const symptomSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    possibleConditions: {
      type: "array",
      items: { type: "string" }
    },
    recommendedSpecialist: {
      type: "string",
      enum: [
        "General Physician",
        "Dermatologist",
        "Cardiologist",
        "Neurologist",
        "Pediatrician"
      ]
    },
    urgencyLevel: {
      type: "string",
      enum: ["low", "medium", "high"]
    },
    basicAdvice: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "possibleConditions",
    "recommendedSpecialist",
    "urgencyLevel",
    "basicAdvice"
  ]
} as const;

const visitPrepSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    visitSummary: {
      type: "string"
    },
    urgencyLevel: {
      type: "string",
      enum: ["low", "medium", "high"]
    },
    clinicianBrief: {
      type: "string"
    },
    recommendedQuestions: {
      type: "array",
      items: { type: "string" }
    },
    careChecklist: {
      type: "array",
      items: { type: "string" }
    },
    redFlags: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "visitSummary",
    "urgencyLevel",
    "clinicianBrief",
    "recommendedQuestions",
    "careChecklist",
    "redFlags"
  ]
} as const;

type VisitPreparationInput = {
  symptoms: string;
  symptomDuration?: string;
  currentMedications?: string;
  allergies?: string;
  medicalHistory?: string;
  visitGoals?: string;
};

function buildVisitPrepFallback(input: VisitPreparationInput): VisitPrepAnalysis {
  const visitGoal =
    input.visitGoals?.trim() || "Clinical review and treatment guidance for the reported symptoms.";
  const combined = [
    input.symptoms,
    input.symptomDuration,
    input.medicalHistory,
    input.allergies
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const urgencyLevel =
    /(chest pain|shortness of breath|faint|confusion|severe|worsening rapidly)/.test(combined)
      ? "high"
      : /(fever|rash|persistent|dizziness|swelling|pain)/.test(combined)
        ? "medium"
        : "low";

  const redFlags =
    urgencyLevel === "high"
      ? [
          "Seek urgent medical care if symptoms become severe, breathing is difficult, or pain escalates quickly."
        ]
      : ["Monitor for worsening symptoms, new severe pain, breathing changes, or fainting."];

  return {
    visitSummary: `Patient reports ${input.symptoms.trim()}${input.symptomDuration ? ` for ${input.symptomDuration.trim()}` : ""}. Visit focus: ${visitGoal}`,
    urgencyLevel,
    clinicianBrief: `Pre-visit intake highlights the main concern as ${input.symptoms.trim()}. Review the reported history, medications, and allergies before the consultation, then confirm onset, severity, and impact on daily activities.`,
    recommendedQuestions: [
      "When did the symptoms begin and how have they changed over time?",
      "What makes the symptoms better or worse?",
      input.currentMedications
        ? "Could any current medications be affecting the symptoms?"
        : "Which medications or remedies have been tried so far?"
    ],
    careChecklist: [
      "Keep a medication list available during the consultation.",
      "Note when the symptoms started and any important changes.",
      "Prepare one or two specific outcomes you want from the visit."
    ],
    redFlags
  };
}

export async function analyzeSymptomsWithLlm(symptoms: string): Promise<SymptomAnalysis> {
  const env = getServerEnv();

  if (!env.LLM_API_KEY) {
    return demoSymptomResponse;
  }

  const client = new OpenAI({
    apiKey: env.LLM_API_KEY
  });

  const response = await client.responses.create({
    model: env.LLM_MODEL ?? "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a cautious telehealth triage assistant. Return concise, non-diagnostic guidance for symptoms. Never claim certainty. Always recommend emergency care for severe red flags."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Analyze these patient symptoms and return possible conditions, recommended specialist, urgency level, and basic advice. Symptoms: ${symptoms}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "symptom_analysis",
        strict: true,
        schema: symptomSchema
      }
    }
  });

  if (!response.output_text) {
    return demoSymptomResponse;
  }

  return JSON.parse(response.output_text) as SymptomAnalysis;
}

export async function analyzeVisitPreparationWithLlm(
  input: VisitPreparationInput
): Promise<VisitPrepAnalysis> {
  const env = getServerEnv();
  const visitGoal =
    input.visitGoals?.trim() || "Clinical review and treatment guidance for the reported symptoms.";

  if (!env.LLM_API_KEY) {
    return buildVisitPrepFallback(input);
  }

  const client = new OpenAI({
    apiKey: env.LLM_API_KEY
  });

  const response = await client.responses.create({
    model: env.LLM_MODEL ?? "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a cautious telehealth intake copilot. Summarize the patient's pre-visit information for clinical review without diagnosing. Highlight missing context, useful follow-up questions, practical preparation steps, and safety red flags when relevant."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Create a visit preparation summary using this intake:\nSymptoms: ${input.symptoms}\nDuration: ${input.symptomDuration || "Not provided"}\nCurrent medications: ${input.currentMedications || "Not provided"}\nAllergies: ${input.allergies || "Not provided"}\nMedical history: ${input.medicalHistory || "Not provided"}\nVisit focus: ${visitGoal}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "visit_preparation_analysis",
        strict: true,
        schema: visitPrepSchema
      }
    }
  });

  if (!response.output_text) {
    return buildVisitPrepFallback(input);
  }

  return JSON.parse(response.output_text) as VisitPrepAnalysis;
}
