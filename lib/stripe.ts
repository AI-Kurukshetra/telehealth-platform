import Stripe from "stripe";

import { getServerEnv } from "@/lib/env";

export function getStripeClient() {
  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover"
  });
}
