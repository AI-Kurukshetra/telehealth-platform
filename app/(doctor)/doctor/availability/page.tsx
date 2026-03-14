import { DoctorAvailabilityForm } from "@/components/forms/doctor-availability-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCurrentDoctorAvailability } from "@/lib/data";

export default async function DoctorAvailabilityPage() {
  const availability = await listCurrentDoctorAvailability();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <DoctorAvailabilityForm availability={availability} />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Availability guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Keep your weekly schedule accurate so patients only see the slots you actually intend to
            offer.
          </p>
          <p>
            Changes here affect new bookings and future reschedules. Existing appointments remain in
            place unless you update them separately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
