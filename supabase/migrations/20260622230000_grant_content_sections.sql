-- Full table privileges for CMS tables (upsert needs INSERT + UPDATE).
-- RLS policies "Admins manage ..." restrict authenticated writes to is_admin().

grant select, insert, update, delete on public.content_sections to authenticated;
grant select, insert, update, delete on public.content_sections to service_role;

grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.site_settings to service_role;