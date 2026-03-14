# Stripe And AI Setup Guide

This document explains, in simple terms, how to set up:

- Stripe Checkout
- Stripe webhooks for local testing
- the LLM key for the symptom analyzer and AI visit prep copilot
- end-to-end test steps

## 1. Required Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

LLM_API_KEY=...
LLM_MODEL=gpt-4o-mini
```

Notes:

- `STRIPE_SECRET_KEY` must be a Stripe **test mode** secret key.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be the matching Stripe **test mode** publishable key.
- `STRIPE_WEBHOOK_SECRET` comes from Stripe CLI webhook forwarding or from the Stripe Dashboard webhook endpoint.
- `LLM_API_KEY` is used by the AI symptom analyzer and AI visit prep copilot.
- `LLM_MODEL` is optional, but `gpt-4o-mini` is a good default for this app.

## 2. Apply Required Supabase SQL

Run these SQL files in Supabase SQL Editor in this order:

1. [supabase/migrations/202603140001_initial_schema.sql](/Users/apple/hackathon-project/supabase/migrations/202603140001_initial_schema.sql)
2. [supabase/migrations/202603140002_enable_messages_realtime.sql](/Users/apple/hackathon-project/supabase/migrations/202603140002_enable_messages_realtime.sql)
3. [supabase/migrations/202603140003_add_stripe_checkout_session.sql](/Users/apple/hackathon-project/supabase/migrations/202603140003_add_stripe_checkout_session.sql)
4. [supabase/migrations/202603140004_hardening_and_scheduling.sql](/Users/apple/hackathon-project/supabase/migrations/202603140004_hardening_and_scheduling.sql)
5. [supabase/migrations/202603140005_fix_recursive_rls_functions.sql](/Users/apple/hackathon-project/supabase/migrations/202603140005_fix_recursive_rls_functions.sql)
6. [supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql](/Users/apple/hackathon-project/supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql)
7. [supabase/migrations/202603140007_fix_recursive_appointments_policy.sql](/Users/apple/hackathon-project/supabase/migrations/202603140007_fix_recursive_appointments_policy.sql)
8. [supabase/migrations/202603140008_add_visit_preparations.sql](/Users/apple/hackathon-project/supabase/migrations/202603140008_add_visit_preparations.sql)
9. [supabase/migrations/202603140009_add_ai_care_plan_to_medical_records.sql](/Users/apple/hackathon-project/supabase/migrations/202603140009_add_ai_care_plan_to_medical_records.sql)
10. [supabase/seed.sql](/Users/apple/hackathon-project/supabase/seed.sql)

## 3. Start The App

```bash
npm install
npm run dev
```

## 4. Stripe Local Webhook Setup

### Install Stripe CLI

If Stripe CLI is not installed:

```bash
brew install stripe/stripe-cli/stripe
```

### Login to Stripe CLI

```bash
stripe login
```

### Forward Stripe events to your local app

Run this in a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Stripe CLI will print a webhook signing secret that looks like:

```bash
whsec_xxxxxxxxxxxxxxxxx
```

Copy that value into:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

Then restart your app:

```bash
npm run dev
```

## 5. How Stripe Payment Flow Works In This App

When a patient books an appointment:

1. the appointment is created in Supabase
2. a `payments` row is created in Supabase
3. the app redirects to Stripe Checkout
4. after payment:
   - Stripe redirects back to the success page
   - webhook updates payment and appointment status
5. pending payments can be retried from the appointments page

## 6. How To Test Stripe

### Step-by-step

1. Log in as a patient.
2. Open `/patient/book`.
3. Create a booking.
4. You should be redirected to Stripe Checkout.
5. Use this Stripe test card:

```text
4242 4242 4242 4242
```

Use:

- any future expiry date
- any 3-digit CVC
- any valid postal code

6. Complete payment.
7. After redirect, open `/patient/appointments`.
8. Confirm the appointment `payment_status` is `paid`.
9. Open your Stripe CLI terminal and confirm events were forwarded.

### If payment remains pending

Check these:

- is `stripe listen --forward-to localhost:3000/api/stripe/webhook` still running?
- is `STRIPE_WEBHOOK_SECRET` set to the same secret shown by Stripe CLI?
- did you restart `npm run dev` after updating `.env.local`?

## 7. How To Test Failed Or Cancelled Payment

1. Start booking normally.
2. On Stripe Checkout, cancel before payment.
3. You should land on:

```text
/patient/payments/cancel
```

4. Open `/patient/appointments`.
5. The appointment should still exist with `payment_status = pending`.
6. Use the `Pay now` action from the appointment list to retry payment.

## 8. AI Symptom Analyzer Setup

Add your AI key:

```env
LLM_API_KEY=your_key_here
LLM_MODEL=gpt-4o-mini
```

Then restart the app:

```bash
npm run dev
```

## 9. How AI Works In This App

The AI layer currently supports:

1. symptom analysis for `/patient/symptom-checker`
2. appointment-linked AI visit prep for `/patient/appointments`
3. AI care plan companion for `/patient/records` and `/doctor/patient-records`

Both features:

1. send structured patient input to a server action
2. use the OpenAI Responses API
3. request structured JSON output
4. return patient-safe guidance instead of free-form raw text

If `LLM_API_KEY` is missing, the app falls back to a safe placeholder result instead of crashing.

## 10. How To Test AI

### Step-by-step

1. Log in as a patient.
2. Open `/patient/symptom-checker`.
3. Enter a realistic symptom description, for example:

```text
I have had chest tightness, mild shortness of breath, and fast heartbeats for two days, especially while walking upstairs.
```

4. Click `Analyze symptoms`.
5. Confirm the result shows:
   - possible conditions
   - specialist recommendation
   - urgency level
   - advice

### Good additional test prompts

```text
I have an itchy red rash on my hands for the last week and it gets worse after using soap.
```

```text
My child has fever, sore throat, and low appetite since yesterday.
```

## 11. How To Test AI Visit Prep Copilot

1. Log in as a patient.
2. Open `/patient/appointments`.
3. Select a scheduled appointment.
4. Complete the `AI visit prep copilot` form.
5. Save the intake and confirm the AI summary appears in the sidebar.
6. Log in as the assigned doctor.
7. Open `/doctor/appointments`.
8. Select the same appointment.
9. Confirm the `AI visit prep brief` appears with the patient intake summary, urgency, and follow-up questions.

## 12. Recommended Local Test Order

Use this exact order:

1. Confirm Supabase auth still works.
2. Confirm appointment booking still works.
3. Confirm Stripe Checkout redirect works.
4. Confirm webhook updates payment status.
5. Confirm pending payment retry works.
6. Confirm AI analyzer returns structured output.
7. Confirm AI visit prep saves for patients and appears for doctors.
8. Confirm AI care plans appear after a doctor saves a medical record.
9. Confirm patient and doctor dashboards still load after these flows.

## 13. Useful Commands

Start app:

```bash
npm run dev
```

Typecheck:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```
