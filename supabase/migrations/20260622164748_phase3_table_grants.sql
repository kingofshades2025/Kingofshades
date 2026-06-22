-- Service role grants for server-side booking (PostgREST requires table privileges; RLS bypassed)
-- GRANT is idempotent — safe to re-run.

grant usage on schema public to service_role;

grant select, insert, update on public.customers to service_role;
grant select, insert, update on public.appointments to service_role;
grant select, insert, update on public.payments to service_role;
grant insert on public.quote_requests to service_role;
grant select on public.blocked_dates to service_role;
grant select, insert on public.audit_logs to service_role;

grant execute on function public.upsert_booking_customer(text, text, text, text) to service_role;

grant usage, select on all sequences in schema public to service_role;
