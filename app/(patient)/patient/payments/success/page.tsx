import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { syncPaymentFromCheckoutSession } from "@/lib/payments";

export default async function PaymentSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; appointment_id?: string }>;
}) {
  const params = await searchParams;

  if (params.session_id) {
    await syncPaymentFromCheckoutSession(params.session_id);
  }

  return (
    <Card className="surface-panel mx-auto max-w-2xl bg-white/80">
      <CardHeader>
        <CardTitle className="text-3xl">Payment received</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Your consultation payment has been recorded. The appointment remains available in your dashboard with the Jitsi visit room.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/patient/appointments">View appointments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/patient/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
