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
          <CardTitle>What to expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Confirm your doctor, time, and payment to reserve the consultation. Your visit details
            will appear immediately in your appointments dashboard.
          </p>
          <p>
            If you need to make a change later, you can manage, reschedule, or cancel the booking
            from your appointments page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
