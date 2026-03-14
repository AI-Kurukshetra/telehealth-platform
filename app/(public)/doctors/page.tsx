import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listDoctors } from "@/lib/data";
import { Logo } from "@/components/logo";

export default async function DoctorsPage() {
  const doctors = await listDoctors();

  return (
    <main className="container py-8">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Logo />
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Verified care directory</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[0.98] text-balance">Choose the right specialist before you book.</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Compare experience, specialization, and fee tiers across the CareBridge AI provider network.
            </p>
          </div>
        </div>
        <Button size="lg" asChild>
          <Link href="/signup">
            Create patient account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="surface-panel overflow-hidden">
            <CardHeader>
              <div className="mb-4 flex items-center justify-between">
                <Badge className="rounded-full">{doctor.specialization}</Badge>
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </div>
              </div>
              <CardTitle className="text-2xl">{doctor.user?.full_name}</CardTitle>
              <CardDescription className="leading-6">{doctor.bio}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Experience</p>
                  <p className="mt-2 text-2xl font-semibold">{doctor.years_of_experience} yrs</p>
                </div>
                <div className="rounded-[1.35rem] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Consultation</p>
                  <p className="mt-2 text-2xl font-semibold">${doctor.consultation_fee}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Book this doctor</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
