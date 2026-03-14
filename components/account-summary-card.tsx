import Link from "next/link";
import { LogOut, Mail, Settings2, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserContext } from "@/lib/data";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function AccountSummaryCard({
  mode,
  settingsPath
}: {
  mode: "compact" | "full";
  settingsPath: string;
}) {
  const { user, doctorProfile, patientProfile } = await getCurrentUserContext();

  const roleLabel = user.role === "doctor" ? "Doctor account" : "Patient account";
  const profileDetail =
    user.role === "doctor"
      ? `${doctorProfile?.specialization ?? "Clinical provider"}${doctorProfile?.years_of_experience ? ` • ${doctorProfile.years_of_experience} years experience` : ""}`
      : `${patientProfile?.age ? `${patientProfile.age} years old` : "Care recipient"}${patientProfile?.gender ? ` • ${patientProfile.gender}` : ""}`;

  if (mode === "compact") {
    return (
      <div className="surface-panel panel-hover motion-fade-up flex w-full items-center justify-between gap-4 rounded-[1.8rem] px-4 py-3 sm:w-auto sm:min-w-[19rem]">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="pulse-ring h-11 w-11 border border-border/60 bg-white/90">
            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={settingsPath}>
              <Settings2 className="mr-2 h-4 w-4" />
              Account
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button size="sm" variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="pulse-ring h-14 w-14 border border-border/60 bg-white/90">
              <AvatarFallback className="text-base font-semibold">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.full_name}</CardTitle>
              <CardDescription>{roleLabel}</CardDescription>
            </div>
          </div>
          <Badge variant="success" className="rounded-full">
            Active session
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.4rem] bg-muted/35 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="rounded-[1.4rem] bg-muted/35 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              {user.role === "doctor" ? (
                <Stethoscope className="h-4 w-4 text-primary" />
              ) : (
                <UserRound className="h-4 w-4 text-primary" />
              )}
              Profile
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{profileDetail}</p>
          </div>
        </div>

        <div className="ai-highlight rounded-[1.4rem] bg-[#fffaf2] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Account access
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your session is protected and role-based. Use logout whenever you finish on a shared
            device.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={settingsPath}>
              <Settings2 className="mr-2 h-4 w-4" />
              Refresh account view
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
