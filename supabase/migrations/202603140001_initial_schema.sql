create extension if not exists "pgcrypto";

create type public.user_role as enum ('patient', 'doctor');
create type public.appointment_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  specialization text not null,
  years_of_experience integer not null check (years_of_experience >= 0),
  consultation_fee numeric(10,2) not null check (consultation_fee >= 0),
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  age integer not null check (age >= 0),
  gender text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_date date not null,
  time_slot text not null,
  status public.appointment_status not null default 'scheduled',
  video_room_id text not null unique,
  payment_status public.payment_status not null default 'pending',
  consultation_fee numeric(10,2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (doctor_id, appointment_date, time_slot)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  diagnosis text not null,
  prescription text not null,
  clinical_notes text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  stripe_payment_intent_id text,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'usd',
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_doctors_specialization on public.doctors(specialization);
create index if not exists idx_appointments_doctor_date on public.appointments(doctor_id, appointment_date);
create index if not exists idx_appointments_patient_date on public.appointments(patient_id, appointment_date);
create index if not exists idx_messages_participants_created_at on public.messages(sender_id, receiver_id, created_at desc);
create index if not exists idx_medical_records_patient on public.medical_records(patient_id, created_at desc);

alter table public.users enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.messages enable row level security;
alter table public.medical_records enable row level security;
alter table public.payments enable row level security;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users for each row execute procedure public.handle_updated_at();
drop trigger if exists doctors_set_updated_at on public.doctors;
create trigger doctors_set_updated_at before update on public.doctors for each row execute procedure public.handle_updated_at();
drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at before update on public.patients for each row execute procedure public.handle_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute procedure public.handle_updated_at();
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();

drop policy if exists "users can view own profile" on public.users;
create policy "users can view own profile"
on public.users
for select
using (auth.uid() = auth_user_id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile"
on public.users
for update
using (auth.uid() = auth_user_id);

drop policy if exists "users can insert own profile" on public.users;
create policy "users can insert own profile"
on public.users
for insert
with check (auth.uid() = auth_user_id);

drop policy if exists "patients and doctors can view doctors" on public.doctors;
create policy "patients and doctors can view doctors"
on public.doctors
for select
using (true);

drop policy if exists "doctor can manage own doctor profile" on public.doctors;
create policy "doctor can manage own doctor profile"
on public.doctors
for all
using (user_id = public.current_app_user_id())
with check (user_id = public.current_app_user_id());

drop policy if exists "patient can manage own patient profile" on public.patients;
create policy "patient can manage own patient profile"
on public.patients
for all
using (user_id = public.current_app_user_id())
with check (user_id = public.current_app_user_id());

drop policy if exists "related doctors can view patient profiles" on public.patients;
create policy "related doctors can view patient profiles"
on public.patients
for select
using (
  user_id = public.current_app_user_id()
  or exists (
    select 1
    from public.appointments
    where appointments.patient_id = patients.id
      and appointments.doctor_id = public.current_doctor_profile_id()
  )
);

drop policy if exists "participants can view appointments" on public.appointments;
create policy "participants can view appointments"
on public.appointments
for select
using (
  doctor_id = public.current_doctor_profile_id()
  or patient_id = public.current_patient_profile_id()
);

drop policy if exists "patients can create appointments" on public.appointments;
create policy "patients can create appointments"
on public.appointments
for insert
with check (
  patient_id = public.current_patient_profile_id()
);

drop policy if exists "participants can update appointments" on public.appointments;
create policy "participants can update appointments"
on public.appointments
for update
using (
  doctor_id = public.current_doctor_profile_id()
  or patient_id = public.current_patient_profile_id()
)
with check (
  doctor_id = public.current_doctor_profile_id()
  or patient_id = public.current_patient_profile_id()
);

drop policy if exists "participants can view messages" on public.messages;
create policy "participants can view messages"
on public.messages
for select
using (
  sender_id = public.current_app_user_id()
  or receiver_id = public.current_app_user_id()
);

drop policy if exists "participants can insert messages" on public.messages;
create policy "participants can insert messages"
on public.messages
for insert
with check (sender_id = public.current_app_user_id());

drop policy if exists "participants can view medical records" on public.medical_records;
create policy "participants can view medical records"
on public.medical_records
for select
using (
  doctor_id in (
    select id from public.doctors where user_id = public.current_app_user_id()
  )
  or patient_id in (
    select id from public.patients where user_id = public.current_app_user_id()
  )
);

drop policy if exists "doctor can create medical records" on public.medical_records;
create policy "doctor can create medical records"
on public.medical_records
for insert
with check (
  doctor_id in (
    select id from public.doctors where user_id = public.current_app_user_id()
  )
);

drop policy if exists "participants can view payments" on public.payments;
create policy "participants can view payments"
on public.payments
for select
using (
  appointment_id in (
    select id
    from public.appointments
    where doctor_id in (
      select id from public.doctors where user_id = public.current_app_user_id()
    )
    or patient_id in (
      select id from public.patients where user_id = public.current_app_user_id()
    )
  )
);
