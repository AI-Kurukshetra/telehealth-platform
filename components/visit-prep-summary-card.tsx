import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VisitPreparation } from "@/lib/types";

function getUrgencyVariant(urgencyLevel: string) {
  if (urgencyLevel === "high") {
    return "destructive";
  }

  if (urgencyLevel === "medium") {
    return "warning";
  }

  return "success";
}

export function VisitPrepSummaryCard({
  preparation
}: {
  preparation: VisitPreparation | null;
}) {
  if (!preparation) {
    return (
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>AI visit prep brief</CardTitle>
          <CardDescription>
            When the patient completes intake, the pre-consultation summary will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>AI visit prep brief</CardTitle>
        <CardDescription>
          Review the patient-submitted intake before the consultation starts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Triage level</p>
          <Badge className="capitalize" variant={getUrgencyVariant(preparation.ai_summary.urgencyLevel)}>
            {preparation.ai_summary.urgencyLevel} priority
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Reported symptoms</p>
          <p className="text-sm leading-6 text-foreground">{preparation.symptoms}</p>
        </div>
        {preparation.symptom_duration ? (
          <div className="rounded-[1.25rem] bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Duration</p>
            <p className="mt-2 text-sm font-medium text-foreground">{preparation.symptom_duration}</p>
          </div>
        ) : null}
        {preparation.current_medications ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current medications</p>
            <p className="text-sm leading-6 text-foreground">{preparation.current_medications}</p>
          </div>
        ) : null}
        {preparation.allergies ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Allergies</p>
            <p className="text-sm leading-6 text-foreground">{preparation.allergies}</p>
          </div>
        ) : null}
        {preparation.medical_history ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Relevant history</p>
            <p className="text-sm leading-6 text-foreground">{preparation.medical_history}</p>
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Clinician brief</p>
          <p className="text-sm leading-6 text-foreground">{preparation.ai_summary.clinicianBrief}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Suggested follow-up questions</p>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {preparation.ai_summary.recommendedQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Red flags to monitor</p>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {preparation.ai_summary.redFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
