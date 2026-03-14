import { listDoctors } from "@/lib/data";
import { BookAppointmentForm } from "@/components/forms/book-appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientBookPage() {
  const doctors = await listDoctors();

  return (
    <>
      <BookAppointmentForm doctors={doctors} />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Payment and consultation notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Booking creates the appointment first, then redirects to Stripe Checkout. Webhook or return-page sync updates `payment_status` so pending appointments can be retried safely from the appointments page.
        </CardContent>
      </Card>
    </>
  );
}
