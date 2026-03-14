import { AppointmentTable } from "@/components/appointment-table";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  countMessagesForCurrentUser,
  listCurrentPatientRecords,
  listPatientAppointments
} from "@/lib/data";

export default async function PatientDashboardPage() {
  const [appointments, records, messageCount] = await Promise.all([
    listPatientAppointments(),
    listCurrentPatientRecords(),
    countMessagesForCurrentUser()
  ]);
  const upcomingCount = appointments.filter((appointment) => appointment.status === "scheduled").length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Upcoming appointments" value={String(upcomingCount)} description="Scheduled consultations in the next 7 days." />
        <MetricCard title="Medical records" value={String(records.length)} description="Visit summaries and prescriptions available online." />
        <MetricCard title="Care messages" value={String(messageCount)} description="Secure messages exchanged with your care team." />
      </section>

      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Upcoming visits</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <AppointmentTable appointments={appointments} role="patient" />
          ) : (
            <p className="text-sm text-muted-foreground">
              No appointments yet. Book your first consultation to see it here.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
