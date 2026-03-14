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
