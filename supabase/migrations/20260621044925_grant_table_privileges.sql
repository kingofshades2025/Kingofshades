-- Fix missing INSERT grants that block CMS upserts and customer creation
grant insert on public.content_sections to authenticated;
grant insert on public.site_settings to authenticated;
grant insert on public.customers to authenticated;
