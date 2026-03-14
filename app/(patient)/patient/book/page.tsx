import { listDoctorAvailability, listDoctors } from "@/lib/data";
import { BookAppointmentForm } from "@/components/forms/book-appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientBookPage() {
  const [doctors, availability] = await Promise.all([
    listDoctors(),
    listDoctorAvailability()
  ]);

  return (
    <div className="space-y-6">
      <BookAppointmentForm doctors={doctors} availability={availability} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Reserve the appointment, complete secure checkout, and your consultation will appear in
            the appointments workspace right away.
          </CardContent>
        </Card>
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Need to make a change?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            You can review visit details, reschedule, cancel, and update your visit prep from the
            appointments page after booking.
          </CardContent>
        </Card>
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Before your consultation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Add symptoms, medications, allergies, and history to give your doctor more context
            before the consultation begins.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
