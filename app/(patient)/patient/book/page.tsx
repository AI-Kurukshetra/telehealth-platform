import { listDoctorAvailability, listDoctors } from "@/lib/data";
import { BookAppointmentForm } from "@/components/forms/book-appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientBookPage() {
  const [doctors, availability] = await Promise.all([
    listDoctors(),
    listDoctorAvailability()
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
      <BookAppointmentForm doctors={doctors} availability={availability} />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Booking guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Booking creates the appointment first, then redirects to Stripe Checkout. Webhook or
            return-page sync updates <code>payment_status</code> so pending appointments can be
            retried safely from the appointments page.
          </p>
          <p>
            Doctors only show the weekly slots they have configured, which reduces scheduling
            conflicts and makes the booking flow production-ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
