alter table public.payments
add column if not exists stripe_checkout_session_id text;

create index if not exists idx_payments_checkout_session_id
on public.payments(stripe_checkout_session_id);
