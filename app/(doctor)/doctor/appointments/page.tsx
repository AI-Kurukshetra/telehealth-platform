import { DoctorAppointmentWorkspace } from "@/components/forms/doctor-appointment-workspace";
import { AppointmentTable } from "@/components/appointment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getVisitPreparationForAppointment,
  listDoctorAppointments,
  listDoctorMedicalRecords
} from "@/lib/data";

export default async function DoctorAppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const [appointments, records, params] = await Promise.all([
    listDoctorAppointments(),
    listDoctorMedicalRecords(),
    searchParams
  ]);
  const selectedAppointmentId = params.appointment ?? appointments[0]?.id;
  const current =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0];
  const existingRecord = current
    ? records.find((record) => record.appointment_id === current.id)
    : null;
  const visitPreparation = current
    ? await getVisitPreparationForAppointment(current.id)
    : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_30rem]">
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
      </div>
      <DoctorAppointmentWorkspace
        appointment={current ?? null}
        existingRecord={existingRecord ?? null}
        visitPreparation={visitPreparation}
      />
    </div>
  );
}
