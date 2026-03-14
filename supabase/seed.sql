insert into public.users (id, email, full_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'sarah@carebridge.ai', 'Dr Sarah Johnson', 'doctor'),
  ('22222222-2222-2222-2222-222222222222', 'michael@carebridge.ai', 'Dr Michael Lee', 'doctor'),
  ('33333333-3333-3333-3333-333333333333', 'emily@carebridge.ai', 'Dr Emily Carter', 'doctor'),
  ('44444444-4444-4444-4444-444444444444', 'alex@carebridge.ai', 'Alex Rivera', 'patient'),
  ('55555555-5555-5555-5555-555555555555', 'maya@carebridge.ai', 'Maya Patel', 'patient')
on conflict (id) do nothing;

insert into public.doctors (id, user_id, specialization, years_of_experience, consultation_fee, bio)
values
  ('aaaaaaa1-1111-4111-8111-111111111111', '11111111-1111-1111-1111-111111111111', 'Dermatologist', 12, 85, 'Specialist in acne, eczema, and preventive skin care.'),
  ('aaaaaaa2-2222-4222-8222-222222222222', '22222222-2222-2222-2222-222222222222', 'Cardiologist', 15, 130, 'Focuses on hypertension, chest discomfort, and heart rhythm care.'),
  ('aaaaaaa3-3333-4333-8333-333333333333', '33333333-3333-3333-3333-333333333333', 'General Physician', 9, 60, 'Primary care physician handling common acute and chronic issues.')
on conflict (id) do nothing;

insert into public.patients (id, user_id, age, gender)
values
  ('bbbbbbb1-1111-4111-8111-111111111111', '44444444-4444-4444-4444-444444444444', 31, 'Male'),
  ('bbbbbbb2-2222-4222-8222-222222222222', '55555555-5555-5555-5555-555555555555', 28, 'Female')
on conflict (id) do nothing;

insert into public.appointments (id, doctor_id, patient_id, appointment_date, time_slot, status, video_room_id, payment_status, consultation_fee)
values
  ('ccccccc1-1111-4111-8111-111111111111', 'aaaaaaa1-1111-4111-8111-111111111111', 'bbbbbbb1-1111-4111-8111-111111111111', '2026-03-15', '09:30 AM', 'scheduled', 'carebridge-derm-001', 'paid', 85),
  ('ccccccc2-2222-4222-8222-222222222222', 'aaaaaaa2-2222-4222-8222-222222222222', 'bbbbbbb2-2222-4222-8222-222222222222', '2026-03-16', '11:00 AM', 'scheduled', 'carebridge-cardio-002', 'pending', 130),
  ('ccccccc3-3333-4333-8333-333333333333', 'aaaaaaa3-3333-4333-8333-333333333333', 'bbbbbbb1-1111-4111-8111-111111111111', '2026-03-13', '02:00 PM', 'completed', 'carebridge-gp-003', 'paid', 60)
on conflict (id) do nothing;

insert into public.messages (id, sender_id, receiver_id, message, created_at)
values
  ('ddddddd1-1111-4111-8111-111111111111', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Hi Dr Sarah, I have a recurring rash on my hands.', '2026-03-14T08:15:00Z'),
  ('ddddddd2-2222-4222-8222-222222222222', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Please upload a photo before the consultation and avoid new skin products.', '2026-03-14T08:17:00Z'),
  ('ddddddd3-3333-4333-8333-333333333333', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'I want to confirm whether my ECG report should be brought to the video visit.', '2026-03-14T09:00:00Z')
on conflict (id) do nothing;

insert into public.medical_records (id, appointment_id, doctor_id, patient_id, diagnosis, prescription, clinical_notes, created_at)
values
  ('eeeeeee1-1111-4111-8111-111111111111', 'ccccccc3-3333-4333-8333-333333333333', 'aaaaaaa3-3333-4333-8333-333333333333', 'bbbbbbb1-1111-4111-8111-111111111111', 'Upper respiratory tract infection', 'Paracetamol 650mg, hydration, steam inhalation', 'Mild fever and cough for 3 days. No respiratory distress noted.', '2026-03-13T14:35:00Z')
on conflict (id) do nothing;

insert into public.payments (appointment_id, stripe_payment_intent_id, amount, currency, status)
values
  ('ccccccc1-1111-4111-8111-111111111111', 'pi_demo_001', 85, 'usd', 'paid'),
  ('ccccccc2-2222-4222-8222-222222222222', 'pi_demo_002', 130, 'usd', 'pending'),
  ('ccccccc3-3333-4333-8333-333333333333', 'pi_demo_003', 60, 'usd', 'paid')
on conflict (appointment_id) do nothing;
