-- Invitation-only customer reviews tied to completed appointments

alter table public.appointments
  add column if not exists review_token uuid unique,
  add column if not exists review_submitted_at timestamptz,
  add column if not exists review_email_sent_at timestamptz;

create index if not exists appointments_review_token_idx
  on public.appointments (review_token)
  where review_token is not null;
