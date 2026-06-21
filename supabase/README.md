# Supabase Setup — King of Shades Phase 2

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy **Project URL** and **anon key** from Settings → API
3. Copy **service_role key** (server-only, never commit)

Add all three to `.env.local` and Vercel environment variables.

## 2. Run the database migration

In Supabase **SQL Editor**, run in order:

1. `supabase/migrations/001_phase2_schema.sql` — tables, RLS, storage
2. `supabase/seed.sql` — initial services, testimonials, settings

## 3. Create your admin account

1. Supabase → **Authentication** → **Users** → **Add user**
   - Email + password for your admin login
2. Copy the user's **UUID**
3. Run in SQL Editor:

```sql
insert into public.admin_profiles (id, email, role)
values ('PASTE_USER_UUID', 'your@email.com', 'super_admin');
```

## 4. Configure Auth redirect URLs

Supabase → Authentication → URL Configuration:

- **Site URL:** `https://kingofshadesnj.com`
- **Redirect URLs:** add:
  - `https://kingofshadesnj.com/auth/callback`
  - `http://localhost:3000/auth/callback`

## 5. Admin login

Visit `/admin/login` and sign in with your admin credentials.

## Tables

| Table | Purpose |
| ----- | ------- |
| `admin_profiles` | Links Supabase Auth users to admin roles |
| `services` | Bookable services on public site |
| `customers` | Customer records |
| `appointments` | Booking requests |
| `gallery_items` | Portfolio images |
| `testimonials` | Customer reviews (approved = public) |
| `site_settings` | Business info, hours, socials |
| `content_sections` | CMS blocks (hero text, about, etc.) |
| `contact_messages` | Contact form submissions |

## Storage

Gallery uploads use the `gallery` bucket (public read, admin write).
