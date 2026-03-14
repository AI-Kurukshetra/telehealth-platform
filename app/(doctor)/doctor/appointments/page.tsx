import { DoctorAvailabilityForm } from "@/components/forms/doctor-availability-form";
import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { AppointmentTable } from "@/components/appointment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listCurrentDoctorAvailability,
  listDoctorAppointments,
  listDoctorMedicalRecords
} from "@/lib/data";

export default async function DoctorAppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const [appointments, records, availability, params] = await Promise.all([
    listDoctorAppointments(),
    listDoctorMedicalRecords(),
    listCurrentDoctorAvailability(),
    searchParams
  ]);
  const selectedAppointmentId = params.appointment ?? appointments[0]?.id;
  const current =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0];
  const existingRecord = current
    ? records.find((record) => record.appointment_id === current.id)
    : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_24rem]">
      <div className="space-y-6">
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Appointment queue</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <AppointmentTable
                appointments={appointments}
                role="doctor"
                managementBasePath="/doctor/appointments"
                selectedAppointmentId={current?.id}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No appointments are in the queue right now.
              </p>
            )}
          </CardContent>
        </Card>
        <DoctorAvailabilityForm availability={availability} />
      </div>
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
              Once a patient books a consultation, the selected appointment will appear here for
              note entry.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
