-- Repair script: booking request + admin quote flow
-- Run in Supabase SQL Editor if migration 20260708180000 failed partway through.
-- Safe to re-run (idempotent where possible).

-- 1. Drop old status constraint before renaming pending -> requested
alter table public.appointments drop constraint if exists appointments_status_check;

-- 2. Migrate legacy status (no-op if already requested)
update public.appointments set status = 'requested' where status = 'pending';

-- 3. New status values
alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('requested', 'quote_sent', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- 4. Quote flow columns
alter table public.appointments
  add column if not exists estimate_line_items jsonb not null default '[]'::jsonb,
  add column if not exists quote_amount_cents integer,
  add column if not exists quote_line_items jsonb not null default '[]'::jsonb,
  add column if not exists quote_pdf_url text,
  add column if not exists quote_notes text,
  add column if not exists quote_sent_at timestamptz;

-- 5. Only confirmed appointments block calendar slots
drop index if exists appointments_slot_unique;
create unique index if not exists appointments_slot_unique
  on public.appointments (appointment_date, appointment_time)
  where status in ('confirmed', 'in_progress', 'completed');

-- 6. Quotes storage bucket
insert into storage.buckets (id, name, public)
values ('quotes', 'quotes', true)
on conflict (id) do nothing;

-- 7. Storage policies (drop first so re-run does not fail)
drop policy if exists "Public read quote PDFs" on storage.objects;
create policy "Public read quote PDFs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'quotes');

drop policy if exists "Admins manage quote PDFs" on storage.objects;
create policy "Admins manage quote PDFs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'quotes' and public.is_admin())
  with check (bucket_id = 'quotes' and public.is_admin());
