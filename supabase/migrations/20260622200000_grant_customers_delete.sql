-- Allow admins to delete customer records (RLS already restricts to is_admin()).

grant delete on public.customers to authenticated;
grant delete on public.customers to service_role;
