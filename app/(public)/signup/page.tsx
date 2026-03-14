import Link from "next/link";
import { BrainCircuit, MessageSquareHeart, Video } from "lucide-react";

import { SignupForm } from "@/components/forms/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <main className="container flex min-h-screen items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <section className="space-y-6">
          <Logo />
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">CareBridge AI onboarding</p>
            <h1 className="text-5xl font-semibold leading-[0.98] text-balance">
              Create your virtual care account in a few minutes.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Patients can book and message providers. Doctors can manage queues, notes, and prescriptions without switching tools.
            </p>
          </div>
          <div className="space-y-4">
            <div className="surface-panel flex items-center gap-4 rounded-[1.6rem] p-4">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Video consultations</p>
                <p className="text-sm text-muted-foreground">Join virtual visits from the appointment workspace.</p>
              </div>
            </div>
            <div className="surface-panel flex items-center gap-4 rounded-[1.6rem] p-4">
              <MessageSquareHeart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Secure messaging</p>
                <p className="text-sm text-muted-foreground">Stay connected with your care team before and after each visit.</p>
              </div>
            </div>
            <div className="surface-panel flex items-center gap-4 rounded-[1.6rem] p-4">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Symptom support</p>
                <p className="text-sm text-muted-foreground">Get a structured care summary before you book.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-8">
          <div className="flex justify-center lg:justify-end">
            <SignupForm />
          </div>
          <p className="text-center text-sm text-muted-foreground lg:text-right">
            Already registered? <Link href="/login" className="font-medium text-primary">Login</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
