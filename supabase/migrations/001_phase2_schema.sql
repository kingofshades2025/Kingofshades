-- King of Shades — Phase 2 schema
-- Run in Supabase SQL Editor or via Supabase CLI

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin profiles (linked to auth.users) — table BEFORE is_admin()
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles where id = auth.uid()
  );
$$;

alter table public.admin_profiles enable row level security;

create policy "Admins can read own profile"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can read all profiles"
  on public.admin_profiles for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tagline text,
  description text,
  category text not null,
  price_label text,
  price_cents integer,
  benefits jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  featured_image_url text,
  accent text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Public can read active services"
  on public.services for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins manage services"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_idx on public.customers (lower(email));

alter table public.customers enable row level security;

create policy "Admins manage customers"
  on public.customers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  service_title text not null,
  appointment_date date not null,
  appointment_time text not null,
  notes text,
  internal_notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'deposit_paid', 'paid', 'refunded')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on public.appointments (appointment_date);
create index if not exists appointments_status_idx on public.appointments (status);

alter table public.appointments enable row level security;

create policy "Anyone can create appointments"
  on public.appointments for insert
  to anon, authenticated
  with check (true);

create policy "Admins manage appointments"
  on public.appointments for select
  to authenticated
  using (public.is_admin());

create policy "Admins update appointments"
  on public.appointments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete appointments"
  on public.appointments for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  category text not null,
  title text not null,
  description text,
  tint text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

create policy "Public can read gallery"
  on public.gallery_items for select
  to anon, authenticated
  using (true);

create policy "Admins manage gallery"
  on public.gallery_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  role text,
  review text not null,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  is_approved boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "Public can read approved testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (is_approved = true);

create policy "Admins manage testimonials"
  on public.testimonials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings (singleton row)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'King of Shades',
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  social_links jsonb not null default '[]'::jsonb,
  business_hours jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins manage site settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Content sections (CMS key-value blocks)
-- ---------------------------------------------------------------------------
create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.content_sections enable row level security;

create policy "Public can read content sections"
  on public.content_sections for select
  to anon, authenticated
  using (true);

create policy "Admins manage content sections"
  on public.content_sections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Admins read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger content_sections_updated_at
  before update on public.content_sections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: gallery bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public read gallery images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy "Admins upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "Admins update gallery images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

create policy "Admins delete gallery images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges (required by PostgREST; RLS still applies)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.services to anon, authenticated;
grant select on public.gallery_items to anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.content_sections to anon, authenticated;

grant insert on public.appointments to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;

grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.gallery_items to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, update on public.site_settings to authenticated;
grant select, update on public.content_sections to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, update on public.contact_messages to authenticated;
grant select, update on public.customers to authenticated;
grant select, update on public.admin_profiles to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Bootstrap admin helper (run manually after creating auth user):
-- insert into public.admin_profiles (id, email, role)
-- values ('YOUR_AUTH_USER_UUID', 'you@email.com', 'super_admin');
-- ---------------------------------------------------------------------------
