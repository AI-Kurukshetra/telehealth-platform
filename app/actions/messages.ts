"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { getCurrentUserContext } from "@/lib/data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validators";
import type { Message } from "@/lib/types";

type MessageState = {
  error: string;
  success: boolean;
  data?: {
    receiverId: string;
    message: string;
  };
  createdMessage?: Message;
};

export async function sendMessageAction(
  _: MessageState,
  formData: FormData
): Promise<MessageState> {
  await requireAuth();

  const parsed = messageSchema.safeParse({
    receiverId: formData.get("receiverId"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { error: "Message cannot be empty.", success: false };
  }

  const { user, patientProfile, doctorProfile } = await getCurrentUserContext();
  const adminSupabase = createAdminSupabaseClient();

  const { data: receiver, error: receiverError } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("id", parsed.data.receiverId)
    .single();

  if (receiverError || !receiver) {
    return { error: "Selected recipient could not be found.", success: false };
  }

  if (receiver.id === user.id) {
    return { error: "You cannot send a message to yourself.", success: false };
  }

  if (receiver.role === user.role) {
    return {
      error: "Messaging is only supported between doctors and patients.",
      success: false
    };
  }

  const relationQuery =
    user.role === "patient"
      ? adminSupabase
          .from("doctors")
          .select("id")
          .eq("user_id", receiver.id)
          .single()
      : adminSupabase
          .from("patients")
          .select("id")
          .eq("user_id", receiver.id)
          .single();

  const { data: counterpartProfile, error: counterpartProfileError } = await relationQuery;

  if (counterpartProfileError || !counterpartProfile) {
    return { error: "Recipient profile could not be loaded.", success: false };
  }

  const appointmentMatch =
    user.role === "patient"
      ? await adminSupabase
          .from("appointments")
          .select("id")
          .eq("patient_id", patientProfile!.id)
          .eq("doctor_id", counterpartProfile.id)
          .limit(1)
          .maybeSingle()
      : await adminSupabase
          .from("appointments")
          .select("id")
          .eq("doctor_id", doctorProfile!.id)
          .eq("patient_id", counterpartProfile.id)
          .limit(1)
          .maybeSingle();

  if (appointmentMatch.error) {
    return { error: appointmentMatch.error.message, success: false };
  }

  if (!appointmentMatch.data) {
    return {
      error: "Messaging is available only after a doctor-patient appointment relationship exists.",
      success: false
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: insertedMessage, error: insertError } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: parsed.data.receiverId,
      message: parsed.data.message
    })
    .select("id, sender_id, receiver_id, message, created_at")
    .single();

  if (insertError) {
    return { error: insertError.message, success: false };
  }

  revalidatePath("/patient/messages");
  revalidatePath("/doctor/messages");

  return {
    error: "",
    success: true,
    data: parsed.data,
    createdMessage: insertedMessage as Message
  };
}
