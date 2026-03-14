"use client";

import { useActionState, useState } from "react";

import { signupAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SPECIALIZATIONS } from "@/lib/constants";

const initialState = { error: "" };

export function SignupForm() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <Card className="surface-panel w-full max-w-2xl border-white/60 bg-white/72">
      <CardHeader>
        <CardTitle className="text-3xl">Create your CareBridge AI account</CardTitle>
        <CardDescription className="leading-6">Select a role and complete the onboarding details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input name="role" type="hidden" value={role} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue={role} onValueChange={(value) => setRole(value as "patient" | "doctor")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required />
            </div>
          </div>

          {role === "patient" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" min={0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" placeholder="Male / Female / Other" required />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select name="specialization">
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Experience</Label>
                <Input id="years_of_experience" name="years_of_experience" type="number" min={0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultation_fee">Consultation fee</Label>
                <Input id="consultation_fee" name="consultation_fee" type="number" min={1} step="0.01" required />
              </div>
            </div>
          )}

          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
