# Deployment — King of Shades

## Two Vercel projects (consolidated)

Production runs on **Shady Boys / kingofshades** only (`www.kingofshadesnj.com`).

The duplicate **mc's projects** deployment (`kingofshades-hazel.vercel.app`) was removed to avoid split env/deploy confusion.

## Rotate Resend API key

Your current key is **send-only** (cannot manage keys via API). To rotate:

1. Go to [Resend → API Keys](https://resend.com/api-keys) and create a new key named `King of Shades Production` with **Sending access** for `kingofshadesnj.com`.
2. Copy the new key (shown once).
3. Run:

```powershell
$env:NEW_RESEND_API_KEY = "re_your_new_key"
$env:VERCEL_TOKEN = "your-shady-boys-vercel-token"   # optional
node scripts/rotate-resend-key.mjs
```

4. Redeploy the Supabase `send-email` function from Cursor (Supabase MCP) or dashboard after updating secrets.
5. Delete the old key in Resend once email is verified on https://www.kingofshadesnj.com/contact

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
