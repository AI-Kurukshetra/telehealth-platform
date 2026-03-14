import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { demoDoctors } from "@/lib/demo-data";

const features = [
  {
    title: "Virtual Consultations",
    description: "Book appointments and join secure Jitsi video sessions with a single click.",
    icon: Video
  },
  {
    title: "Care Team Messaging",
    description: "Realtime chat keeps doctors and patients aligned before and after visits.",
    icon: MessageSquareHeart
  },
  {
    title: "Smart Scheduling",
    description: "Specialist search, structured availability, and a seamless booking experience.",
    icon: CalendarClock
  },
  {
    title: "Protected Records",
    description: "Care records, notes, and prescriptions stay available to the right people.",
    icon: ShieldCheck
  }
];

const stats = [
  { label: "Average booking flow", value: "2 min" },
  { label: "Realtime care threads", value: "24/7" },
  { label: "Specialist handoffs", value: "3 roles" }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-6rem] top-20 h-52 w-52 bg-[#ebb45c]/35" />
      <div className="hero-orb right-[-4rem] top-12 h-64 w-64 bg-[#2c8c92]/25" />
      <div className="container py-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Logo />
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="motion-stagger space-y-8">
            <div className="motion-fade-up inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-medium text-secondary-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Telehealth care coordination with AI-assisted intake
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] text-foreground md:text-6xl">
                A warmer, faster virtual care experience for patients and providers.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                CareBridge AI handles booking, secure messaging, video visits, records, and AI-assisted intake in a single dashboard built for modern telehealth operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/doctors">Browse doctors</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="surface-panel panel-hover motion-fade-up rounded-[1.75rem] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel panel-hover motion-fade-up relative overflow-hidden rounded-[2.25rem] p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(20,136,145,0.14),transparent)]" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="rounded-full bg-white/80 text-primary">AI-first care</Badge>
                  <h2 className="mt-4 text-3xl font-semibold">Built for modern virtual care</h2>
                </div>
                <div className="pulse-ring flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
              </div>

              <Card className="border-white/50 bg-white/70">
                <CardHeader>
                  <CardTitle>Provider network</CardTitle>
                  <CardDescription>
                    Explore specialties, experience, and consultation fees across the CareBridge AI network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoDoctors.map((doctor) => (
                    <div key={doctor.id} className="panel-hover flex items-center justify-between rounded-[1.4rem] bg-[#fffaf1] px-4 py-3">
                      <div>
                        <p className="font-semibold">{doctor.specialization}</p>
                        <p className="text-sm text-muted-foreground">${doctor.consultation_fee} consultation fee</p>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Accepting visits
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="panel-hover rounded-[1.75rem] border border-white/60 bg-white/60 p-5">
                    <feature.icon className="mb-3 h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
