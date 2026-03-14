import { HeartPulse, ShieldAlert, Stethoscope } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarePlanSummary } from "@/lib/types";

export function AiCarePlanCard({
  carePlan,
  audience
}: {
  carePlan?: CarePlanSummary | null;
  audience: "patient" | "doctor";
}) {
  if (!carePlan) {
    return null;
  }

  return (
    <Card className="border-[#dce7e8] bg-[#f7fbfb]">
      <CardHeader>
        <CardTitle>AI care plan companion</CardTitle>
        <CardDescription>
          {audience === "patient"
            ? "A patient-friendly summary of the treatment plan from this visit."
            : "A patient-facing care summary generated from the clinical record."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="rounded-[1.3rem] bg-white/80 p-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Stethoscope className="h-4 w-4 text-primary" />
            Condition summary
          </div>
          <p className="mt-2 leading-6 text-muted-foreground">{carePlan.conditionSummary}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.3rem] bg-white/80 p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <HeartPulse className="h-4 w-4 text-primary" />
              Medication guidance
            </div>
            <ul className="mt-3 space-y-2 leading-6 text-muted-foreground">
              {carePlan.medicationGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.3rem] bg-white/80 p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Warning signs
            </div>
            <ul className="mt-3 space-y-2 leading-6 text-muted-foreground">
              {carePlan.warningSigns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-[1.3rem] bg-white/80 p-4">
          <p className="font-medium text-foreground">Home care steps</p>
          <ul className="mt-3 space-y-2 leading-6 text-muted-foreground">
            {carePlan.homeCareSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.3rem] bg-white/80 p-4">
          <p className="font-medium text-foreground">Follow-up recommendation</p>
          <p className="mt-2 leading-6 text-muted-foreground">{carePlan.followUpRecommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
