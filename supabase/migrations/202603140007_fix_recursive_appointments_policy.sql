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
