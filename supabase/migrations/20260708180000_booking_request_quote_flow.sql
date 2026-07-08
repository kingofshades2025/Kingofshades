-- Booking request + admin quote flow

update public.appointments set status = 'requested' where status = 'pending';

alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('requested', 'quote_sent', 'confirmed', 'in_progress', 'completed', 'cancelled'));

alter table public.appointments
  add column if not exists estimate_line_items jsonb not null default '[]'::jsonb,
  add column if not exists quote_amount_cents integer,
  add column if not exists quote_line_items jsonb not null default '[]'::jsonb,
  add column if not exists quote_pdf_url text,
  add column if not exists quote_notes text,
  add column if not exists quote_sent_at timestamptz;

-- Only confirmed appointments block calendar slots
drop index if exists appointments_slot_unique;
create unique index if not exists appointments_slot_unique
  on public.appointments (appointment_date, appointment_time)
  where status in ('confirmed', 'in_progress', 'completed');

insert into storage.buckets (id, name, public)
values ('quotes', 'quotes', true)
on conflict (id) do nothing;

create policy "Public read quote PDFs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'quotes');

create policy "Admins manage quote PDFs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'quotes' and public.is_admin())
  with check (bucket_id = 'quotes' and public.is_admin());
