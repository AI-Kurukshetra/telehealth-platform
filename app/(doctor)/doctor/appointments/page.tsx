import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { AppointmentTable } from "@/components/appointment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDoctorAppointments, listDoctorMedicalRecords } from "@/lib/data";

export default async function DoctorAppointmentsPage() {
  const [appointments, records] = await Promise.all([
    listDoctorAppointments(),
    listDoctorMedicalRecords()
  ]);
  const current = appointments[0];
  const existingRecord = current
    ? records.find((record) => record.appointment_id === current.id)
    : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Appointment queue</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <AppointmentTable appointments={appointments} role="doctor" />
          ) : (
            <p className="text-sm text-muted-foreground">
              No appointments are in the queue right now.
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>{existingRecord ? "Update medical note" : "Add medical note"}</CardTitle>
        </CardHeader>
        <CardContent>
          {current ? (
            <MedicalRecordForm
              appointmentId={current.id}
              patientId={current.patient_id}
              defaultValues={
                existingRecord
                  ? {
                      diagnosis: existingRecord.diagnosis,
                      prescription: existingRecord.prescription,
                      clinicalNotes: existingRecord.clinical_notes
                    }
                  : undefined
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Once a patient books a consultation, the selected appointment will appear here for note entry.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
