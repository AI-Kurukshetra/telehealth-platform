import { redirect } from "next/navigation";

import { getServerEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

type AppointmentPaymentContext = {
  appointmentId: string;
  paymentId: string;
  amount: number;
  currency: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
};

async function getAppointmentPaymentContext(appointmentId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, appointment_date, time_slot, consultation_fee, payment_status")
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    throw new Error(appointmentError?.message ?? "Appointment not found.");
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, amount, currency, status")
    .eq("appointment_id", appointment.id)
    .single();

  if (paymentError || !payment) {
    throw new Error(paymentError?.message ?? "Payment row not found.");
  }

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id, user_id")
    .eq("id", appointment.doctor_id)
    .single();

  if (doctorError || !doctor) {
    throw new Error(doctorError?.message ?? "Doctor not found.");
  }

  const { data: doctorUser, error: doctorUserError } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", doctor.user_id)
    .single();

  if (doctorUserError || !doctorUser) {
    throw new Error(doctorUserError?.message ?? "Doctor user not found.");
  }

  return {
    appointment,
    payment,
    doctorUser
  };
}

export async function createCheckoutSessionForAppointment(appointmentId: string) {
  const env = getServerEnv();
  const stripe = getStripeClient();
  const supabase = await createServerSupabaseClient();

  const { appointment, payment, doctorUser } = await getAppointmentPaymentContext(
    appointmentId
  );

  if (payment.status === "paid") {
    redirect("/patient/payments/success?appointment_id=" + appointment.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.NEXT_PUBLIC_APP_URL}/patient/payments/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/patient/payments/cancel?appointment_id=${appointment.id}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: payment.currency,
          unit_amount: Math.round(Number(payment.amount) * 100),
          product_data: {
            name: `Consultation with ${doctorUser.full_name}`,
            description: `CareBridge AI telehealth appointment on ${appointment.appointment_date} at ${appointment.time_slot}`
          }
        }
      }
    ],
    metadata: {
      appointment_id: appointment.id,
      payment_id: payment.id
    }
  });

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      stripe_checkout_session_id: session.id
    })
    .eq("id", payment.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!session.url) {
    throw new Error("Stripe Checkout session URL was not returned.");
  }

  redirect(session.url);
}

export async function syncPaymentFromCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  const supabase = createAdminSupabaseClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"]
  });

  const paymentId = session.metadata?.payment_id;
  const appointmentId = session.metadata?.appointment_id;

  if (!paymentId || !appointmentId) {
    throw new Error("Stripe session metadata is missing payment context.");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const nextStatus =
    session.payment_status === "paid"
      ? "paid"
      : session.status === "expired"
        ? "failed"
        : "pending";

  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      status: nextStatus
    })
    .eq("id", paymentId);

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const { error: appointmentError } = await supabase
    .from("appointments")
    .update({
      payment_status: nextStatus
    })
    .eq("id", appointmentId);

  if (appointmentError) {
    throw new Error(appointmentError.message);
  }

  return {
    paymentId,
    appointmentId,
    status: nextStatus
  };
}

export async function getPatientPaymentHistory() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, appointment_id, amount, currency, status, stripe_checkout_session_id, stripe_payment_intent_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
