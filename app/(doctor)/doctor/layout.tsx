import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DOCTOR_NAV_ITEMS } from "@/lib/constants";

export default async function DoctorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole("doctor");

  return (
    <DashboardShell
      items={DOCTOR_NAV_ITEMS}
      title="Doctor Workspace"
      settingsPath="/doctor/settings"
    >
      {children}
    </DashboardShell>
  );
}
