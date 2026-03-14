import { AppointmentTable } from "@/components/appointment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPatientAppointments } from "@/lib/data";

export default async function PatientAppointmentsPage() {
  const appointments = await listPatientAppointments();

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>All appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <AppointmentTable appointments={appointments} role="patient" />
        ) : (
          <p className="text-sm text-muted-foreground">
            No appointments found for this patient account yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
