alter table public.medical_records
  add column if not exists ai_care_plan jsonb;
