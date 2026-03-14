"use client";

import { useActionState } from "react";

import { analyzeSymptomsAction } from "@/app/actions/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const initialState = { error: "", success: false, result: undefined };

export function SymptomCheckerForm() {
  const [state, action, pending] = useActionState(analyzeSymptomsAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>AI symptom analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <Textarea
              name="symptoms"
              placeholder="Describe symptoms, onset, severity, and anything that makes them better or worse."
            />
            <div className="rounded-[1.25rem] bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This tool is informational only. It does not replace a doctor or emergency services.
            </div>
            {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
            <Button disabled={pending}>{pending ? "Analyzing..." : "Analyze symptoms"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Suggested next step</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.success && state.result ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Possible conditions</p>
                <div className="flex flex-wrap gap-2">
                  {state.result.possibleConditions.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended specialist</p>
                  <p className="text-lg font-semibold">{state.result.recommendedSpecialist}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                  <Badge variant={state.result.urgencyLevel === "high" ? "destructive" : state.result.urgencyLevel === "medium" ? "warning" : "success"}>
                    {state.result.urgencyLevel}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Basic advice</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {state.result.basicAdvice.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.25rem] bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                Seek emergency care immediately for severe chest pain, breathing difficulty, confusion, or rapidly worsening symptoms.
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Results appear here after submission. The analyzer now uses the configured LLM key when available and falls back to a safe placeholder only if no key is configured.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
