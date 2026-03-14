"use client";

import { useActionState } from "react";

import { createMedicalRecordAction } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState = { error: "", success: false, data: undefined };

export function MedicalRecordForm({
  appointmentId,
  patientId,
  defaultValues
}: {
  appointmentId: string;
  patientId: string;
  defaultValues?: {
    diagnosis?: string;
    prescription?: string;
    clinicalNotes?: string;
  };
}) {
  const [state, action, pending] = useActionState(createMedicalRecordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input id="diagnosis" name="diagnosis" defaultValue={defaultValues?.diagnosis} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prescription">Prescription</Label>
        <Input id="prescription" name="prescription" defaultValue={defaultValues?.prescription} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clinicalNotes">Clinical notes</Label>
        <Textarea id="clinicalNotes" name="clinicalNotes" defaultValue={defaultValues?.clinicalNotes} required />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-emerald-700">
          Medical record saved successfully and the AI care plan is ready.
        </p>
      ) : null}
      <Button disabled={pending}>{pending ? "Saving..." : "Save record"}</Button>
    </form>
  );
}
