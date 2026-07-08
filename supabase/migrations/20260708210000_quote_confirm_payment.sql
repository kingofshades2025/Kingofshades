-- Client quote confirmation with Stripe or cash payment choice

alter table public.appointments
  add column if not exists quote_confirm_token uuid unique,
  add column if not exists quote_confirmed_at timestamptz,
  add column if not exists payment_method text;

alter table public.appointments drop constraint if exists appointments_payment_method_check;
alter table public.appointments add constraint appointments_payment_method_check
  check (payment_method is null or payment_method in ('stripe', 'cash'));

create index if not exists appointments_quote_confirm_token_idx
  on public.appointments (quote_confirm_token)
  where quote_confirm_token is not null;
