# Deployment — King of Shades

## Two Vercel projects (consolidate when ready)

| Project | Team | URL | Role |
| ------- | ---- | --- | ---- |
| **kingofshades** | Shady Boys | `www.kingofshadesnj.com` | **Production** — GitHub auto-deploy from `main` |
| **kingofshades** | mc's projects | `kingofshades-hazel.vercel.app` | Legacy duplicate — env vars set, no custom domain |

**Recommended:** Keep only the **Shady Boys** project for production. The mc's projects deployment can be deleted or kept as a personal preview — it is not linked to the custom domain.

Local CLI is linked to **mc's projects** (`.vercel/project.json`). GitHub pushes deploy to **Shady Boys**.

## Environment variables (Shady Boys / production)

Set on [Vercel → shady-boys → kingofshades → Environment Variables](https://vercel.com/shady-boys/kingofshades/settings/environment-variables):

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | Also in `vercel.json` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Also in `vercel.json` |
| `NEXT_PUBLIC_APP_URL` | `https://kingofshadesnj.com` |
| `EMAIL_FROM` | Also in `vercel.json` |
| `EMAIL_TO` | Also in `vercel.json` |
| `RESEND_API_KEY` | **Required for direct Resend** — optional if Supabase email function is deployed |
| `EMAIL_FUNCTION_SECRET` | Optional — defaults to `kos-email-gate-2026` |

**Automated sync** (Shady Boys Vercel token required):

```powershell
$env:VERCEL_TOKEN = "your-shady-boys-token"
node scripts/sync-shady-boys-env-api.mjs
```

Or PowerShell CLI script (after `vercel login` on Shady Boys account):

```powershell
.\scripts\sync-shady-boys-env.ps1
```

## Email on production

If `RESEND_API_KEY` is missing on Vercel, the app falls back to the Supabase Edge Function `send-email`, which holds the Resend key as a Supabase secret.

Redeploy the function after rotating the Resend key:

```bash
# From project root, with Supabase CLI logged in:
supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FUNCTION_SECRET=kos-email-gate-2026 --project-ref ertxeyopvtoclwkfrmso
supabase functions deploy send-email --project-ref ertxeyopvtoclwkfrmso
```

## Supabase Auth URLs

In [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/ertxeyopvtoclwkfrmso/auth/url-configuration):

- **Site URL:** `https://kingofshadesnj.com`
- **Redirect URLs:**
  - `https://kingofshadesnj.com/auth/callback`
  - `https://www.kingofshadesnj.com/auth/callback`
  - `http://localhost:3000/auth/callback`

**Automated sync** (Supabase access token required):

```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-token"
node scripts/sync-supabase-auth-urls.mjs
```

Password reset was verified against the production redirect URL.

## Supabase project

- **Ref:** `ertxeyopvtoclwkfrmso`
- **URL:** `https://ertxeyopvtoclwkfrmso.supabase.co`
