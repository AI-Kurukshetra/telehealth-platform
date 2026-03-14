# CareBridge AI Status

This document captures the current implementation state of the project, what you need to set up before testing, and what is actually testable right now.

## 1. Before You Test

### Environment

Make sure `.env.local` contains valid values for:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
LLM_API_KEY=...
LLM_MODEL=gpt-4o-mini
```

Minimum required for current testing:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Install dependencies

```bash
npm install
```

### Supabase database setup

Run the SQL files in this order inside your Supabase SQL editor:

1. [supabase/migrations/202603140001_initial_schema.sql](/Users/apple/hackathon-project/supabase/migrations/202603140001_initial_schema.sql)
2. [supabase/migrations/202603140002_enable_messages_realtime.sql](/Users/apple/hackathon-project/supabase/migrations/202603140002_enable_messages_realtime.sql)
3. [supabase/migrations/202603140003_add_stripe_checkout_session.sql](/Users/apple/hackathon-project/supabase/migrations/202603140003_add_stripe_checkout_session.sql)
4. [supabase/migrations/202603140004_hardening_and_scheduling.sql](/Users/apple/hackathon-project/supabase/migrations/202603140004_hardening_and_scheduling.sql)
5. [supabase/migrations/202603140005_fix_recursive_rls_functions.sql](/Users/apple/hackathon-project/supabase/migrations/202603140005_fix_recursive_rls_functions.sql)
6. [supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql](/Users/apple/hackathon-project/supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql)
7. [supabase/migrations/202603140007_fix_recursive_appointments_policy.sql](/Users/apple/hackathon-project/supabase/migrations/202603140007_fix_recursive_appointments_policy.sql)
8. [supabase/migrations/202603140008_add_visit_preparations.sql](/Users/apple/hackathon-project/supabase/migrations/202603140008_add_visit_preparations.sql)
9. [supabase/seed.sql](/Users/apple/hackathon-project/supabase/seed.sql)

### Supabase Auth settings

Current auth uses Supabase email/password signup and login.

Recommended for local MVP testing:

- Disable email confirmation temporarily in Supabase Auth, or
- If email confirmation is enabled, verify the email before trying to log in.

### Run the app

```bash
npm run dev
```

Useful validation commands:

```bash
npm run typecheck
npm run lint
npm run build
```

## 2. What Is Completed

### Project foundation

- Next.js App Router project created
- TypeScript configured
- Tailwind CSS configured
- shadcn-style component structure added
- App-wide UI shell and shared components created
- Responsive public, patient, and doctor route groups created

### Public pages

Implemented pages:

- `/`
- `/login`
- `/signup`
- `/doctors`

### Authentication

Implemented:

- Patient signup
- Doctor signup
- Role stored in user metadata
- Login with Supabase Auth
- Logout action
- Role-aware redirect after login/signup

Important:

- Signup currently creates:
  - Supabase auth user
  - `users` row
  - `patients` or `doctors` row

### Role protection

Implemented:

- Patient-only route layout protection
- Doctor-only route layout protection
- Supabase session refresh/proxy wiring

### Patient app pages

Implemented page structure:

- `/patient/dashboard`
- `/patient/book`
- `/patient/appointments`
- `/patient/messages`
- `/patient/records`
- `/patient/symptom-checker`

### Doctor app pages

Implemented page structure:

- `/doctor/dashboard`
- `/doctor/appointments`
- `/doctor/messages`
- `/doctor/patient-records`

### Database

Implemented tables:

- `users`
- `doctors`
- `patients`
- `appointments`
- `messages`
- `medical_records`
- `payments`

Implemented database features:

- UUID primary keys
- timestamps
- foreign keys
- indexes
- enum types
- row-level security enabled
- stronger RLS policies for appointments, messages, records, users, and payments
- doctor availability table added
- unread message tracking added
- scheduling validation and active-slot uniqueness added

### Seed/demo data

Added:

- 3 doctors
- 2 patients
- 3 appointments
- sample messages
- sample medical record
- sample payments

### Jitsi integration

Implemented:

- Unique `video_room_id` generation logic
- Join consultation link flow using `https://meet.jit.si/{video_room_id}`

### AI symptom analyzer

Implemented:

- Symptom checker page and form
- Server action for analysis
- OpenAI-backed structured response flow when `LLM_API_KEY` is configured
- Safe fallback response when no AI key is configured

### AI visit prep copilot

Implemented:

- Patient-side pre-visit intake attached to an appointment
- AI-generated visit summary, urgency, prep checklist, and follow-up questions
- Doctor-side AI prep brief on the appointments workspace
- Supabase-backed persistence for visit preparation data

### UI/UX

Completed so far:

- Public landing page redesigned
- Auth pages redesigned
- Dashboard shell redesigned
- Sidebar, cards, forms, tables, and messaging surfaces improved
- Appointment management panel added for reschedule/cancel/payment retry
- Doctor weekly availability manager added
- Better conversation layout, unread indicators, and responsive table handling
- Responsive layout in place for public and dashboard pages

## 3. What Is Testable Right Now

You can test these flows now:

### Works with real Supabase

- signup as patient
- signup as doctor
- login
- logout
- role-based redirect after auth
- role-protected route access
- doctors directory reads
- appointment booking persistence
- patient appointment reads
- doctor appointment reads
- message persistence
- message conversation reads
- realtime message updates on active conversation
- medical record persistence
- patient medical record reads
- doctor medical record reads
- doctor availability management
- patient reschedule flow
- patient cancellation flow
- unread message indicators and read tracking
- Stripe Checkout payment redirect
- Stripe payment sync via webhook and success-page reconciliation
- LLM-backed symptom analysis
- AI visit prep copilot save and review flow

### Works as UI/demo flow

- open patient pages
- open doctor pages
- click join consultation links

## 4. What Is Still Mocked or Incomplete

This is important for testing expectations.

### Remaining non-final areas

Most core patient and doctor flows now read and write real Supabase data. The remaining non-final areas are:

- AI fallback responses when `LLM_API_KEY` is missing
- webhook forwarding setup for local Stripe testing
- no email/SMS notifications yet
- no audit log or error monitoring integration yet
- no dedicated doctor reschedule/cancel workflow yet

### Booking persistence

Current booking action:

- validates form input
- validates doctor availability for the chosen weekday
- generates `video_room_id`
- inserts appointment into Supabase
- inserts payment row into Supabase
- prevents double-booking of active doctor slots at both app and database level
- revalidates the appointment dashboards after booking

### Messaging persistence/realtime

Current messaging flow:

- validates form
- writes message rows to Supabase
- loads real doctor-patient conversation threads
- subscribes to Supabase Realtime for active conversation updates
- marks conversations as read and shows unread badges
- blocks messaging unless a doctor-patient appointment relationship exists

### Medical records persistence

Current medical record flow:

- validates form
- creates or updates a medical record tied to the appointment
- verifies the doctor owns the appointment
- marks the appointment as completed after record save
- refreshes doctor and patient record views

### AI integration

Current symptom analyzer:

- uses a server action
- calls the configured LLM provider when `LLM_API_KEY` is present
- falls back safely when no AI key is configured

### Stripe integration

Stripe flow now includes:

- Stripe Checkout session creation after booking
- retry payment from pending appointments
- payment status sync from webhook
- success-page payment reconciliation for local/dev fallback

Still required for local webhook testing:

- Stripe webhook forwarding to `/api/stripe/webhook`

## 5. Suggested Test Plan

### Auth

1. Open `/signup`
2. Create a patient account
3. Confirm you land on `/patient/dashboard`
4. Log out
5. Create a doctor account
6. Confirm you land on `/doctor/dashboard`
7. Try opening the wrong dashboard route manually and confirm redirect behavior

### Public UI

1. Open `/`
2. Open `/doctors`
3. Check mobile and desktop responsiveness

### Patient flow

1. Log in as a patient
2. Open:
   - `/patient/dashboard`
   - `/patient/book`
   - `/patient/appointments`
   - `/patient/messages`
   - `/patient/records`
   - `/patient/symptom-checker`
3. Submit the booking form
4. Complete Stripe Checkout
5. Submit the symptom checker form
6. Click a consultation join link

### Doctor flow

1. Log in as a doctor
2. Open:
   - `/doctor/dashboard`
   - `/doctor/appointments`
   - `/doctor/messages`
   - `/doctor/patient-records`
3. Submit the medical record form

## 6. Current File References

Core setup:

- [package.json](/Users/apple/hackathon-project/package.json)
- [components.json](/Users/apple/hackathon-project/components.json)
- [tailwind.config.ts](/Users/apple/hackathon-project/tailwind.config.ts)
- [app/globals.css](/Users/apple/hackathon-project/app/globals.css)

Auth:

- [app/actions/auth.ts](/Users/apple/hackathon-project/app/actions/auth.ts)
- [lib/auth.ts](/Users/apple/hackathon-project/lib/auth.ts)
- [lib/supabase/server.ts](/Users/apple/hackathon-project/lib/supabase/server.ts)
- [lib/supabase/admin.ts](/Users/apple/hackathon-project/lib/supabase/admin.ts)
- [proxy.ts](/Users/apple/hackathon-project/proxy.ts)

Database:

- [supabase/migrations/202603140001_initial_schema.sql](/Users/apple/hackathon-project/supabase/migrations/202603140001_initial_schema.sql)
- [supabase/migrations/202603140002_enable_messages_realtime.sql](/Users/apple/hackathon-project/supabase/migrations/202603140002_enable_messages_realtime.sql)
- [supabase/migrations/202603140003_add_stripe_checkout_session.sql](/Users/apple/hackathon-project/supabase/migrations/202603140003_add_stripe_checkout_session.sql)
- [supabase/migrations/202603140004_hardening_and_scheduling.sql](/Users/apple/hackathon-project/supabase/migrations/202603140004_hardening_and_scheduling.sql)
- [supabase/migrations/202603140005_fix_recursive_rls_functions.sql](/Users/apple/hackathon-project/supabase/migrations/202603140005_fix_recursive_rls_functions.sql)
- [supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql](/Users/apple/hackathon-project/supabase/migrations/202603140006_allow_doctors_to_view_related_patients.sql)
- [supabase/migrations/202603140007_fix_recursive_appointments_policy.sql](/Users/apple/hackathon-project/supabase/migrations/202603140007_fix_recursive_appointments_policy.sql)
- [supabase/seed.sql](/Users/apple/hackathon-project/supabase/seed.sql)

Supporting files and fallbacks:

- [lib/demo-data.ts](/Users/apple/hackathon-project/lib/demo-data.ts)
- [lib/data.ts](/Users/apple/hackathon-project/lib/data.ts)

## 7. Recommended Next Build Steps

In the next implementation pass, the highest-value work is:

1. Add email/SMS notifications and reminder workflows
2. Add monitoring, audit logging, and deployment hardening
