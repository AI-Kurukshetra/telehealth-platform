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
