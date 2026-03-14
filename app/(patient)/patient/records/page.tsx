import { AiCarePlanCard } from "@/components/ai-care-plan-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCurrentPatientRecords } from "@/lib/data";

export default async function PatientRecordsPage() {
  const records = await listCurrentPatientRecords();

  return (
    <div className="grid gap-6">
      {records.length === 0 ? (
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>No medical records yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your doctor-created visit records and prescriptions will appear here after consultations are completed.
          </CardContent>
        </Card>
      ) : null}
      {records.map((record) => (
        <Card key={record.id} className="bg-white/95">
          <CardHeader>
            <CardTitle>{record.diagnosis}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Doctor:</span> {record.doctor?.full_name ?? "Assigned doctor"}</p>
            <p><span className="font-medium text-foreground">Prescription:</span> {record.prescription}</p>
            <p><span className="font-medium text-foreground">Clinical notes:</span> {record.clinical_notes}</p>
            <AiCarePlanCard carePlan={record.ai_care_plan} audience="patient" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
