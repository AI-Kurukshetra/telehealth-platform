import { AppointmentManagementPanel } from "@/components/forms/appointment-management-panel";
import { AppointmentTable } from "@/components/appointment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDoctorAvailability, listPatientAppointments } from "@/lib/data";

export default async function PatientAppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const [appointments, availability, params] = await Promise.all([
    listPatientAppointments(),
    listDoctorAvailability(),
    searchParams
  ]);
  const selectedAppointmentId = params.appointment ?? appointments[0]?.id;
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0];
  const selectedAvailability = selectedAppointment
    ? availability.filter((slot) => slot.doctor_id === selectedAppointment.doctor_id)
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_24rem]">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>All appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <AppointmentTable
              appointments={appointments}
              role="patient"
              managementBasePath="/patient/appointments"
              selectedAppointmentId={selectedAppointment?.id}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No appointments found for this patient account yet.
            </p>
          )}
        </CardContent>
      </Card>
      {selectedAppointment ? (
        <AppointmentManagementPanel
          appointment={selectedAppointment}
          availability={selectedAvailability}
        />
      ) : (
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>No appointment selected</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Once you book a consultation, appointment management and rescheduling controls will
            appear here.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
