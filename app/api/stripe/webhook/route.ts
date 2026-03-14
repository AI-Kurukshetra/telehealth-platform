import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getServerEnv } from "@/lib/env";
import { syncPaymentFromCheckoutSession } from "@/lib/payments";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const env = getServerEnv();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret missing", { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "Invalid Stripe event",
      { status: 400 }
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    await syncPaymentFromCheckoutSession(session.id);
  }

  return NextResponse.json({ received: true });
}
