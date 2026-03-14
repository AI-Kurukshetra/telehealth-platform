alter table public.messages
  add column if not exists read_at timestamptz;

alter table public.appointments
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by_user_id uuid references public.users(id) on delete set null,
  add column if not exists cancellation_reason text;

alter table public.appointments
  drop constraint if exists appointments_doctor_id_appointment_date_time_slot_key;

create unique index if not exists idx_appointments_active_doctor_slot
on public.appointments (doctor_id, appointment_date, time_slot)
where status <> 'cancelled';

create table if not exists public.doctor_availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  time_slot text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (doctor_id, weekday, time_slot)
);

create index if not exists idx_doctor_availability_doctor_weekday
on public.doctor_availability(doctor_id, weekday);

alter table public.doctor_availability enable row level security;

drop trigger if exists doctor_availability_set_updated_at on public.doctor_availability;
create trigger doctor_availability_set_updated_at
before update on public.doctor_availability
for each row execute procedure public.handle_updated_at();

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

create or replace function public.current_patient_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.patients
  where user_id = public.current_app_user_id()
  limit 1
$$;

create or replace function public.current_doctor_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.doctors
  where user_id = public.current_app_user_id()
  limit 1
$$;

create or replace function public.can_access_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_user_id = public.current_app_user_id()
    or exists (
      select 1
      from public.appointments a
      join public.doctors d on d.id = a.doctor_id
      join public.patients p on p.id = a.patient_id
      where
        (d.user_id = public.current_app_user_id() and p.user_id = target_user_id)
        or
        (p.user_id = public.current_app_user_id() and d.user_id = target_user_id)
    )
$$;

create or replace function public.validate_appointment_write()
returns trigger
language plpgsql
as $$
declare
  requested_weekday integer;
begin
  if tg_op = 'UPDATE' then
    if new.doctor_id <> old.doctor_id or new.patient_id <> old.patient_id then
      raise exception 'Appointments cannot change ownership once created.';
    end if;
  end if;

  if new.status <> 'cancelled' then
    if new.appointment_date < current_date then
      raise exception 'Appointments cannot be scheduled in the past.';
    end if;

    requested_weekday := extract(dow from new.appointment_date);

    if not exists (
      select 1
      from public.doctor_availability availability
      where availability.doctor_id = new.doctor_id
        and availability.weekday = requested_weekday
        and availability.time_slot = new.time_slot
    ) then
      raise exception 'The selected doctor is unavailable for that time slot.';
    end if;
  end if;

  if new.status = 'cancelled' and new.cancelled_at is null then
    new.cancelled_at = timezone('utc', now());
  end if;

  if new.status <> 'cancelled' then
    new.cancelled_at = null;
    new.cancelled_by_user_id = null;
    new.cancellation_reason = null;
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_validate_write on public.appointments;
create trigger appointments_validate_write
before insert or update on public.appointments
for each row execute procedure public.validate_appointment_write();

drop policy if exists "users can view own profile" on public.users;
create policy "users can view own or related profiles"
on public.users
for select
using (public.can_access_user(id));

drop policy if exists "participants can insert messages" on public.messages;
create policy "participants can insert messages"
on public.messages
for insert
with check (
  sender_id = public.current_app_user_id()
  and exists (
    select 1
    from public.appointments a
    join public.doctors d on d.id = a.doctor_id
    join public.patients p on p.id = a.patient_id
    where (
      d.user_id = sender_id and p.user_id = receiver_id
    ) or (
      p.user_id = sender_id and d.user_id = receiver_id
    )
  )
);

drop policy if exists "receivers can mark messages read" on public.messages;
create policy "receivers can mark messages read"
on public.messages
for update
using (receiver_id = public.current_app_user_id())
with check (receiver_id = public.current_app_user_id());

drop policy if exists "doctor can create medical records" on public.medical_records;
create policy "doctor can create medical records"
on public.medical_records
for insert
with check (
  doctor_id = public.current_doctor_profile_id()
);

drop policy if exists "doctor can update own medical records" on public.medical_records;
create policy "doctor can update own medical records"
on public.medical_records
for update
using (doctor_id = public.current_doctor_profile_id())
with check (doctor_id = public.current_doctor_profile_id());

drop policy if exists "patients can create payments" on public.payments;
create policy "patients can create payments"
on public.payments
for insert
with check (
  appointment_id in (
    select id
    from public.appointments
    where patient_id = public.current_patient_profile_id()
  )
);

drop policy if exists "patients can update own payments" on public.payments;
create policy "patients can update own payments"
on public.payments
for update
using (
  appointment_id in (
    select id
    from public.appointments
    where patient_id = public.current_patient_profile_id()
  )
)
with check (
  appointment_id in (
    select id
    from public.appointments
    where patient_id = public.current_patient_profile_id()
  )
);

drop policy if exists "everyone can view doctor availability" on public.doctor_availability;
create policy "everyone can view doctor availability"
on public.doctor_availability
for select
using (true);

drop policy if exists "doctor can manage own availability" on public.doctor_availability;
create policy "doctor can manage own availability"
on public.doctor_availability
for all
using (doctor_id = public.current_doctor_profile_id())
with check (doctor_id = public.current_doctor_profile_id());

create or replace view public.doctor_directory as
select
  d.id,
  d.user_id,
  u.full_name,
  d.specialization,
  d.years_of_experience,
  d.consultation_fee,
  d.bio,
  d.created_at,
  d.updated_at
from public.doctors d
join public.users u on u.id = d.user_id;

grant select on public.doctor_directory to anon, authenticated;

insert into public.doctor_availability (doctor_id, weekday, time_slot)
select
  d.id,
  weekday_slot.weekday,
  weekday_slot.time_slot
from public.doctors d
cross join (
  values
    (1, '09:00 AM'),
    (1, '09:30 AM'),
    (1, '10:00 AM'),
    (1, '10:30 AM'),
    (1, '11:00 AM'),
    (1, '11:30 AM'),
    (1, '02:00 PM'),
    (1, '02:30 PM'),
    (1, '03:00 PM'),
    (2, '09:00 AM'),
    (2, '09:30 AM'),
    (2, '10:00 AM'),
    (2, '10:30 AM'),
    (2, '11:00 AM'),
    (2, '11:30 AM'),
    (2, '02:00 PM'),
    (2, '02:30 PM'),
    (2, '03:00 PM'),
    (3, '09:00 AM'),
    (3, '09:30 AM'),
    (3, '10:00 AM'),
    (3, '10:30 AM'),
    (3, '11:00 AM'),
    (3, '11:30 AM'),
    (3, '02:00 PM'),
    (3, '02:30 PM'),
    (3, '03:00 PM'),
    (4, '09:00 AM'),
    (4, '09:30 AM'),
    (4, '10:00 AM'),
    (4, '10:30 AM'),
    (4, '11:00 AM'),
    (4, '11:30 AM'),
    (4, '02:00 PM'),
    (4, '02:30 PM'),
    (4, '03:00 PM'),
    (5, '09:00 AM'),
    (5, '09:30 AM'),
    (5, '10:00 AM'),
    (5, '10:30 AM'),
    (5, '11:00 AM'),
    (5, '11:30 AM'),
    (5, '02:00 PM'),
    (5, '02:30 PM'),
    (5, '03:00 PM')
) as weekday_slot(weekday, time_slot)
on conflict (doctor_id, weekday, time_slot) do nothing;
