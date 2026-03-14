import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PaymentCancelPage({
  searchParams
}: {
  searchParams: Promise<{ appointment_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card className="surface-panel mx-auto max-w-2xl bg-white/80">
      <CardHeader>
        <CardTitle className="text-3xl">Payment not completed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Your appointment is still saved, but the payment is pending. You can reopen the appointment list and complete payment again at any time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/patient/appointments">Retry payment</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={params.appointment_id ? `/patient/appointments` : "/patient/dashboard"}>
              Back to dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
