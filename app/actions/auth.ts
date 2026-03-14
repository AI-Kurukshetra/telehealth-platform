"use server";

import { redirect } from "next/navigation";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  doctorSignupSchema,
  loginSchema,
  patientSignupSchema
} from "@/lib/validators";

type AuthState = { error: string };

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createServerSupabaseClient();
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const role = data.user.user_metadata.role as "patient" | "doctor" | undefined;
  redirect(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
}

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const basePayload = {
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  };

  const role = String(formData.get("role") ?? "");
  const parsed =
    role === "doctor"
      ? doctorSignupSchema.safeParse({
          ...basePayload,
          specialization: formData.get("specialization"),
          years_of_experience: formData.get("years_of_experience"),
          consultation_fee: formData.get("consultation_fee")
        })
      : patientSignupSchema.safeParse({
          ...basePayload,
          age: formData.get("age"),
          gender: formData.get("gender")
        });

  if (!parsed.success) {
    return { error: "Please complete all required fields correctly." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data:
        parsed.data.role === "doctor"
          ? {
              role: "doctor",
              full_name: parsed.data.name,
              specialization: parsed.data.specialization,
              years_of_experience: parsed.data.years_of_experience,
              consultation_fee: parsed.data.consultation_fee
            }
          : {
              role: "patient",
              full_name: parsed.data.name,
              age: parsed.data.age,
              gender: parsed.data.gender
            }
    }
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Unable to create account." };
  }

  const adminSupabase = createAdminSupabaseClient();
  const { error: userInsertError } = await adminSupabase.from("users").upsert({
    auth_user_id: data.user.id,
    email: parsed.data.email,
    full_name: parsed.data.name,
    role: parsed.data.role
  });

  if (userInsertError) {
    return { error: userInsertError.message };
  }

  const { data: appUser, error: appUserError } = await adminSupabase
    .from("users")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .single();

  if (appUserError) {
    return { error: appUserError.message };
  }

  const profilePayload =
    parsed.data.role === "doctor"
      ? {
          user_id: appUser.id,
          specialization: parsed.data.specialization,
          years_of_experience: parsed.data.years_of_experience,
          consultation_fee: parsed.data.consultation_fee
        }
      : {
          user_id: appUser.id,
          age: parsed.data.age,
          gender: parsed.data.gender
        };

  const targetTable = parsed.data.role === "doctor" ? "doctors" : "patients";
  const { error: profileError } = await adminSupabase
    .from(targetTable)
    .upsert(profilePayload);

  if (profileError) {
    return { error: profileError.message };
  }

  redirect(parsed.data.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
