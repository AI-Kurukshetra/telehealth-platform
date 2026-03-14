# CareBridge AI

Production-ready SaaS starter for a telehealth and patient engagement platform built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, Stripe, Jitsi Meet, and server actions.

Detailed current status and testing guide:

- [docs/PROJECT_STATUS.md](/Users/apple/hackathon-project/docs/PROJECT_STATUS.md)
- [docs/STRIPE_AI_SETUP.md](/Users/apple/hackathon-project/docs/STRIPE_AI_SETUP.md)

## Included MVP Areas

- Public marketing landing page and doctor directory
- Supabase-ready auth flows for patient and doctor roles
- Patient dashboard, booking, appointments, messaging, records, and symptom checker
- Doctor dashboard, appointments, messages, and patient records
- Supabase SQL schema and seed data
- Jitsi consultation links and Stripe-ready payment status handling

## Setup

1. Copy `.env.example` to `.env.local` and provide Supabase, Stripe, and LLM credentials.
2. Install dependencies with `npm install`.
3. Run the SQL in `supabase/migrations/202603140001_initial_schema.sql`.
4. Run the SQL in `supabase/migrations/202603140002_enable_messages_realtime.sql`.
5. Run the SQL in `supabase/migrations/202603140003_add_stripe_checkout_session.sql`.
6. Run the SQL in `supabase/migrations/202603140004_hardening_and_scheduling.sql`.
7. Run the SQL in `supabase/migrations/202603140005_fix_recursive_rls_functions.sql`.
8. Run the SQL in `supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql`.
9. Run the SQL in `supabase/migrations/202603140007_fix_recursive_appointments_policy.sql`.
10. Run the SQL in `supabase/migrations/202603140008_add_visit_preparations.sql`.
11. Run the SQL in `supabase/migrations/202603140009_add_ai_care_plan_to_medical_records.sql`.
12. Run the SQL in `supabase/seed.sql`.
13. Start the app with `npm run dev`.

## Notes

- Core auth, booking, messaging, records, payments, symptom analysis, AI visit prep, and AI care plan flows now use live Supabase-backed data.
- The service-role client is reserved for admin-only paths such as auth provisioning and Stripe webhook reconciliation.
