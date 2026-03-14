"use client";

import { useActionState } from "react";

import { saveVisitPreparationAction } from "@/app/actions/visit-prep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VisitPreparation } from "@/lib/types";

const initialState = { error: "", success: false, preparation: undefined };

function getUrgencyVariant(urgencyLevel: string) {
  if (urgencyLevel === "high") {
    return "destructive";
  }

  if (urgencyLevel === "medium") {
    return "warning";
  }

  return "success";
}

export function VisitPrepCopilotForm({
  appointmentId,
  existingPreparation
}: {
  appointmentId: string;
  existingPreparation: VisitPreparation | null;
}) {
  const [state, action, pending] = useActionState(saveVisitPreparationAction, initialState);
  const activePreparation = state.preparation ?? existingPreparation;

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>AI visit prep copilot</CardTitle>
        <CardDescription>
          Share the details your doctor should know before the consultation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={action} className="space-y-4">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <div className="space-y-2">
            <Label htmlFor="visit-prep-symptoms">Primary symptoms</Label>
            <Textarea
              id="visit-prep-symptoms"
              name="symptoms"
              defaultValue={existingPreparation?.symptoms}
              placeholder="Describe the main symptoms, severity, and how they affect you."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-prep-duration">How long has this been happening?</Label>
            <Input
              id="visit-prep-duration"
              name="symptomDuration"
              defaultValue={existingPreparation?.symptom_duration ?? ""}
              placeholder="For example: 3 days, 2 weeks, since yesterday"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-prep-medications">Current medications</Label>
            <Textarea
              id="visit-prep-medications"
              name="currentMedications"
              defaultValue={existingPreparation?.current_medications ?? ""}
              placeholder="List prescription medicines, supplements, or remedies you are using."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-prep-allergies">Allergies</Label>
            <Textarea
              id="visit-prep-allergies"
              name="allergies"
              defaultValue={existingPreparation?.allergies ?? ""}
              placeholder="Food, medication, environmental, or seasonal allergies."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-prep-history">Relevant medical history</Label>
            <Textarea
              id="visit-prep-history"
              name="medicalHistory"
              defaultValue={existingPreparation?.medical_history ?? ""}
              placeholder="Past diagnoses, surgeries, recurring issues, or family history that may help."
            />
          </div>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-emerald-700">
              Visit prep saved. Your doctor can now review the intake summary before the visit.
            </p>
          ) : null}
          <Button disabled={pending}>{pending ? "Generating brief..." : "Save visit prep"}</Button>
        </form>

        {activePreparation ? (
          <div className="space-y-4 rounded-[1.5rem] border border-border/60 bg-[#fffaf2] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">AI preparation summary</p>
              <Badge
                className="capitalize"
                variant={getUrgencyVariant(activePreparation.ai_summary.urgencyLevel)}
              >
                {activePreparation.ai_summary.urgencyLevel} priority
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Visit summary</p>
              <p className="text-sm leading-6 text-foreground">
                {activePreparation.ai_summary.visitSummary}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Preparation checklist</p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {activePreparation.ai_summary.careChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Helpful follow-up topics</p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {activePreparation.ai_summary.recommendedQuestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
