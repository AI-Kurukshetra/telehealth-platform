create table if not exists public.visit_preparations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  symptoms text not null,
  symptom_duration text,
  current_medications text,
  allergies text,
  medical_history text,
  visit_goals text not null,
  ai_summary jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_visit_preparations_doctor on public.visit_preparations(doctor_id, created_at desc);
create index if not exists idx_visit_preparations_patient on public.visit_preparations(patient_id, created_at desc);

alter table public.visit_preparations enable row level security;

drop trigger if exists visit_preparations_set_updated_at on public.visit_preparations;
create trigger visit_preparations_set_updated_at
before update on public.visit_preparations
for each row execute procedure public.handle_updated_at();

create or replace function public.can_access_appointment(target_appointment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments
    where id = target_appointment_id
      and (
        doctor_id = public.current_doctor_profile_id()
        or patient_id = public.current_patient_profile_id()
      )
  )
$$;

drop policy if exists "participants can view visit preparations" on public.visit_preparations;
create policy "participants can view visit preparations"
on public.visit_preparations
for select
using (public.can_access_appointment(appointment_id));

drop policy if exists "patients can create own visit preparations" on public.visit_preparations;
create policy "patients can create own visit preparations"
on public.visit_preparations
for insert
with check (
  patient_id = public.current_patient_profile_id()
  and exists (
    select 1
    from public.appointments
    where id = appointment_id
      and patient_id = public.current_patient_profile_id()
      and doctor_id = visit_preparations.doctor_id
  )
);

drop policy if exists "patients can update own visit preparations" on public.visit_preparations;
create policy "patients can update own visit preparations"
on public.visit_preparations
for update
using (
  patient_id = public.current_patient_profile_id()
  and public.can_access_appointment(appointment_id)
)
with check (
  patient_id = public.current_patient_profile_id()
  and exists (
    select 1
    from public.appointments
    where id = appointment_id
      and patient_id = public.current_patient_profile_id()
      and doctor_id = visit_preparations.doctor_id
  )
);
