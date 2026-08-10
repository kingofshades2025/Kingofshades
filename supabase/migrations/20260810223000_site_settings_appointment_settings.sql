-- Add appointment workflow settings column used by admin Settings save.
-- App code already writes appointment_settings; production schema was missing it.

alter table public.site_settings
  add column if not exists appointment_settings jsonb not null default '{
    "requireQuoteBeforeConfirm": true,
    "autoConfirmOnDepositPaid": true
  }'::jsonb;
