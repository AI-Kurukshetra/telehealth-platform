import { AccountSummaryCard } from "@/components/account-summary-card";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Logo } from "@/components/logo";

export function DashboardShell({
  items,
  title,
  settingsPath,
  children
}: {
  items: readonly { href: string; label: string }[];
  title: string;
  settingsPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-stage min-h-screen">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 xl:px-8">
        <div className="glass-divider mb-6 flex flex-col gap-4 pb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="motion-fade-up">
            <Logo />
          </div>
          <div className="motion-fade-up">
            <AccountSummaryCard mode="compact" settingsPath={settingsPath} />
          </div>
        </div>
        <div className="grid items-start gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <AppSidebar items={items} title={title} />
          <main className="motion-stagger min-w-0 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
