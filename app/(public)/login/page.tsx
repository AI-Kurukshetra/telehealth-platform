import Link from "next/link";
import { Activity, CalendarRange, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="container flex min-h-screen items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-6">
          <Logo />
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">CareBridge AI access</p>
            <h1 className="text-5xl font-semibold leading-[0.98] text-balance">
              Step into a calmer care workflow.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Access appointments, secure messaging, visit rooms, and records from one connected care workspace.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-panel rounded-[1.75rem] p-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm font-semibold">Protected access</p>
            </div>
            <div className="surface-panel rounded-[1.75rem] p-4">
              <CalendarRange className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm font-semibold">Appointment management</p>
            </div>
            <div className="surface-panel rounded-[1.75rem] p-4">
              <Activity className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm font-semibold">Care coordination</p>
            </div>
          </div>
        </section>
        <section className="space-y-8">
          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
          <p className="text-center text-sm text-muted-foreground lg:text-right">
            Need an account? <Link href="/signup" className="font-medium text-primary">Sign up</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
