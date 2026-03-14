import { AppSidebar } from "@/components/layout/app-sidebar";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Bell, ShieldCheck } from "lucide-react";

export function DashboardShell({
  items,
  title,
  children
}: {
  items: readonly { href: string; label: string }[];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="container py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Logo />
          <div className="surface-panel flex items-center gap-3 rounded-full px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Platform status</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Secure telehealth workspace</p>
                <Badge variant="success" className="rounded-full">Live</Badge>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-border/80 lg:block" />
            <div className="hidden items-center gap-2 lg:flex">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Role-protected access</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <AppSidebar items={items} title={title} />
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
