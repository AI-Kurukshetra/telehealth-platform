import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PATIENT_NAV_ITEMS } from "@/lib/constants";

export default async function PatientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole("patient");

  return (
    <DashboardShell
      items={PATIENT_NAV_ITEMS}
      title="Patient Portal"
      settingsPath="/patient/settings"
    >
      {children}
    </DashboardShell>
  );
}
