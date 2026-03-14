"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppSidebar({
  items,
  title
}: {
  items: readonly { href: string; label: string }[];
  title: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="surface-panel w-full rounded-[2rem] p-5 xl:sticky xl:top-6 xl:self-start">
      <div className="mb-8 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(20,136,145,0.12),rgba(237,165,67,0.12))] p-4">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          One place for appointments, messaging, records, and virtual consultations.
        </p>
      </div>
      <nav className="grid gap-2">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-[1.35rem] px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(17,94,89,0.2)]"
                  : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
              )}
            >
              <span>{item.label}</span>
              <ChevronRight className={cn("h-4 w-4 transition-transform", active ? "translate-x-0" : "-translate-x-1 opacity-0 group-hover:opacity-100")} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
