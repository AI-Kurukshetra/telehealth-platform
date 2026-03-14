import { AppointmentTable } from "@/components/appointment-table";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  countMessagesForCurrentUser,
  listDoctorAppointments,
  listDoctorMedicalRecords
} from "@/lib/data";

export default async function DoctorDashboardPage() {
  const [appointments, records, messageCount] = await Promise.all([
    listDoctorAppointments(),
    listDoctorMedicalRecords(),
    countMessagesForCurrentUser()
  ]);
  const scheduledCount = appointments.filter((appointment) => appointment.status === "scheduled").length;
  const pendingNotesCount = appointments.filter(
    (appointment) => !records.some((record) => record.appointment_id === appointment.id)
  ).length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Today queue" value={String(scheduledCount)} description="Consultations and follow-ups assigned for this doctor." />
        <MetricCard title="Pending notes" value={String(pendingNotesCount)} description="Appointments still waiting for a saved clinical record." />
        <MetricCard title="Patient messages" value={String(messageCount)} description="Secure messages exchanged with assigned patients." />
      </section>

      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Upcoming consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <AppointmentTable appointments={appointments} role="doctor" />
          ) : (
            <p className="text-sm text-muted-foreground">
              No consultations are scheduled for this doctor yet.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
