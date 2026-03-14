import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDoctorMedicalRecords } from "@/lib/data";

export default async function DoctorPatientRecordsPage() {
  const records = await listDoctorMedicalRecords();

  return (
    <div className="grid gap-6">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Patient medical history</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review prior diagnoses, prescriptions, and consultation notes across your patient consultations.
        </CardContent>
      </Card>
      {records.length === 0 ? (
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>No medical records saved yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Once you save a consultation note, it will appear here for review.
          </CardContent>
        </Card>
      ) : null}
      {records.map((record) => (
        <Card key={record.id} className="bg-white/95">
          <CardHeader>
            <CardTitle>{record.diagnosis}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Patient:</span> {record.patient?.full_name ?? "Assigned patient"}</p>
            <p><span className="font-medium text-foreground">Prescription:</span> {record.prescription}</p>
            <p><span className="font-medium text-foreground">Clinical notes:</span> {record.clinical_notes}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
