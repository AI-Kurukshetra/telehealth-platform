import OpenAI from "openai";

import { getServerEnv } from "@/lib/env";
import { demoSymptomResponse } from "@/lib/demo-data";
import type { SymptomAnalysis } from "@/lib/types";

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
