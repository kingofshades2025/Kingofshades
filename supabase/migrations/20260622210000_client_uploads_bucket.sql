-- Client reference uploads for bookings and quote requests (images + PDF).
insert into storage.buckets (id, name, public)
values ('client-uploads', 'client-uploads', true)
on conflict (id) do nothing;

create policy "Public read client uploads"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'client-uploads');

create policy "Admins manage client uploads"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'client-uploads' and public.is_admin())
  with check (bucket_id = 'client-uploads' and public.is_admin());
