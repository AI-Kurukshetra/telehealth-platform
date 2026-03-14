import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  const appRole = user.user_metadata.role as UserRole | undefined;

  if (appRole !== role) {
    redirect(appRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
  }

  return user;
}
