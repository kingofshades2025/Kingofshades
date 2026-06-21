-- Phase 3: Booking, payments, quotes, scheduling

-- ---------------------------------------------------------------------------
-- Appointments — extended fields & in_progress status
-- ---------------------------------------------------------------------------
alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));

alter table public.appointments
  add column if not exists appointment_number text unique,
  add column if not exists total_cents integer,
  add column if not exists deposit_cents integer,
  add column if not exists amount_paid_cents integer not null default 0,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists customer_address text,
  add column if not exists duration_minutes integer not null default 120;

create unique index if not exists appointments_slot_unique
  on public.appointments (appointment_date, appointment_time)
  where status not in ('cancelled');

-- ---------------------------------------------------------------------------
-- Customers — portal & Stripe
-- ---------------------------------------------------------------------------
alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists stripe_customer_id text,
  add column if not exists address text;

create index if not exists customers_auth_user_idx on public.customers (auth_user_id);

-- Booking-time customer upsert (bypasses admin-only RLS)
create or replace function public.upsert_booking_customer(
  p_name text,
  p_email text,
  p_phone text default null,
  p_address text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.customers where lower(email) = lower(trim(p_email));
  if v_id is not null then
    update public.customers
    set
      name = trim(p_name),
      phone = nullif(trim(coalesce(p_phone, '')), ''),
      address = coalesce(nullif(trim(coalesce(p_address, '')), ''), address)
    where id = v_id;
    return v_id;
  end if;
  insert into public.customers (name, email, phone, address)
  values (
    trim(p_name),
    trim(p_email),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_address, '')), '')
  )
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.upsert_booking_customer(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Site settings — booking / payment / notification config
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column if not exists booking_settings jsonb not null default '{
    "slotDurationMinutes": 120,
    "bufferMinutes": 15,
    "maxDailyAppointments": 8,
    "closedWeekdays": [0],
    "weekdayStart": "08:00",
    "weekdayEnd": "18:00",
    "saturdayStart": "09:00",
    "saturdayEnd": "16:00",
    "sundayClosed": true
  }'::jsonb,
  add column if not exists payment_settings jsonb not null default '{
    "acceptDeposits": true,
    "acceptFullPayment": true,
    "depositPercent": 25,
    "taxRatePercent": 8.875
  }'::jsonb,
  add column if not exists notification_settings jsonb not null default '{
    "emailRemindersEnabled": true,
    "reminder24hEnabled": true,
    "reminder2hEnabled": true,
    "smsEnabled": false
  }'::jsonb;

-- ---------------------------------------------------------------------------
-- Blocked dates (admin blackout)
-- ---------------------------------------------------------------------------
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  blocked_date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.blocked_dates enable row level security;

create policy "Public can read blocked dates"
  on public.blocked_dates for select
  to anon, authenticated
  using (true);

create policy "Admins manage blocked dates"
  on public.blocked_dates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  payment_type text not null check (payment_type in ('deposit', 'full', 'refund', 'invoice')),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payments_appointment_idx on public.payments (appointment_id);
create index if not exists payments_created_idx on public.payments (created_at desc);

alter table public.payments enable row level security;

create policy "Admins manage payments"
  on public.payments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers read own payments"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = payments.customer_id and c.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Quote requests
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  service_type text not null,
  description text not null,
  measurements text,
  photo_urls jsonb not null default '[]'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quote_sent', 'approved', 'rejected')),
  quoted_amount_cents integer,
  admin_notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

create policy "Anyone can submit quote requests"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

create policy "Admins manage quote requests"
  on public.quote_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers read own quotes"
  on public.quote_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = quote_requests.customer_id and c.auth_user_id = auth.uid()
    )
    or lower(customer_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

create trigger quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Customer portal — read own appointments
-- ---------------------------------------------------------------------------
create policy "Customers read own appointments"
  on public.appointments for select
  to authenticated
  using (
    exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.auth_user_id = auth.uid()
    )
    or lower(customer_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

create policy "Admins insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_admin());

grant insert on public.blocked_dates to authenticated;
grant select on public.blocked_dates to anon, authenticated;
