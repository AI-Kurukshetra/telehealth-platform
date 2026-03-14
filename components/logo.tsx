import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.35rem] bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(17,94,89,0.24)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),transparent_60%)]" />
        <HeartPulse className="relative h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight text-foreground">CareBridge AI</p>
        <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Connected virtual care</p>
      </div>
    </Link>
  );
}
