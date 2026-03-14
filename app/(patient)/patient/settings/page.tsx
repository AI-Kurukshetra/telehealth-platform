import { AccountSummaryCard } from "@/components/account-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientSettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AccountSummaryCard mode="full" settingsPath="/patient/settings" />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Account guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Use this page to confirm which patient account is currently active before booking,
            messaging, or reviewing records.
          </p>
          <p>
            If you are using a shared device, sign out when you finish so your information remains
            protected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
