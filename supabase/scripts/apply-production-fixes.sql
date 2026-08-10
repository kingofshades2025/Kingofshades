-- Production fixes: run once in Supabase SQL Editor
-- Project: ertxeyopvtoclwkfrmso

-- Phase 1: Service image columns
alter table public.services
  add column if not exists detail_image_url text,
  add column if not exists finish_image_url text;

-- Phase 1: Missing INSERT grants
grant insert on public.content_sections to authenticated;
grant insert on public.site_settings to authenticated;
grant insert on public.customers to authenticated;

-- Admin Settings: appointment workflow JSON column
alter table public.site_settings
  add column if not exists appointment_settings jsonb not null default '{
    "requireQuoteBeforeConfirm": true,
    "autoConfirmOnDepositPaid": true
  }'::jsonb;
