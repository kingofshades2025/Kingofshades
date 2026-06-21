#!/usr/bin/env node
/**
 * Update Supabase Auth URL configuration for production.
 *
 * Requires a Supabase access token:
 *   https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   set SUPABASE_ACCESS_TOKEN=your_token
 *   node scripts/sync-supabase-auth-urls.mjs
 */

const PROJECT_REF = "ertxeyopvtoclwkfrmso";
const SITE_URL = "https://kingofshadesnj.com";
const REDIRECT_URLS = [
  "https://kingofshadesnj.com/auth/callback",
  "https://www.kingofshadesnj.com/auth/callback",
  "http://localhost:3000/auth/callback",
  "https://kingofshades-hazel.vercel.app/auth/callback",
  "https://kingofshades-*.vercel.app/auth/callback",
].join(",");

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error("Set SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_url: SITE_URL,
        uri_allow_list: REDIRECT_URLS,
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed:", data);
    process.exit(1);
  }

  console.log("✓ site_url:", data.site_url ?? SITE_URL);
  console.log("✓ uri_allow_list:", data.uri_allow_list ?? REDIRECT_URLS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
