"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <Card className="surface-panel w-full max-w-md border-white/60 bg-white/72">
      <CardHeader>
        <CardTitle className="text-3xl">Welcome back</CardTitle>
        <CardDescription className="leading-6">Sign in to access your care workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
