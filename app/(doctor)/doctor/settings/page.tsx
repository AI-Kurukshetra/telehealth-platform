import { AccountSummaryCard } from "@/components/account-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorSettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AccountSummaryCard mode="full" settingsPath="/doctor/settings" />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Workspace guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Confirm your doctor profile details here before managing appointments, messaging
            patients, or saving consultation notes.
          </p>
          <p>
            Logging out at the end of a session is recommended, especially on shared clinic
            devices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
