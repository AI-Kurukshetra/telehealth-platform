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
4. Run the SQL in `supabase/seed.sql`.
5. Start the app with `npm run dev`.

## Notes

- The current UI renders from demo data so the product shell is explorable immediately.
- Server actions are structured so Supabase persistence, Stripe checkout, and the LLM provider can be wired in without reworking the route structure.
