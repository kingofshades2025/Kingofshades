#!/usr/bin/env node
/**
 * One-shot production setup for Phase 3.
 *
 * Required env (add to .env.local or export before running):
 *   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens
 *   SUPABASE_SERVICE_ROLE_KEY — optional; used to verify tables after migration
 *   STRIPE_SECRET_KEY — optional; registers webhook if set
 *
 * Usage:
 *   node scripts/setup-production.mjs
 *   node scripts/setup-production.mjs --migration-only
 *   node scripts/setup-production.mjs --verify-only
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const PROJECT_REF = "ertxeyopvtoclwkfrmso";
const SITE_URL = "https://www.kingofshadesnj.com";
const WEBHOOK_URL = `${SITE_URL}/api/stripe/webhook`;

const REDIRECT_URLS = [
  `${SITE_URL}/auth/callback`,
  `${SITE_URL}/auth/callback?next=/portal`,
  "https://kingofshadesnj.com/auth/callback",
  "https://kingofshadesnj.com/auth/callback?next=/portal",
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/callback?next=/portal",
].join(",");

const REQUIRED_VERCEL_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/\r$/, "");
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const flags = new Set(process.argv.slice(2));
const migrationOnly = flags.has("--migration-only");
const verifyOnly = flags.has("--verify-only");

async function runPhase3Migration(token) {
  const sql = readFileSync(
    join(root, "supabase/migrations/20260622164657_phase3_booking_payments.sql"),
    "utf8",
  );

  console.log("\n▶ Applying phase3_booking_payments migration via Supabase Management API…");
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const body = await res.text();
  if (!res.ok) {
    console.error("Migration failed:", body);
    process.exit(1);
  }
  console.log("✓ Migration 004 applied.");
}

async function syncAuthUrls(token) {
  console.log("\n▶ Syncing Supabase auth redirect URLs…");
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
    console.error("Auth URL sync failed:", data);
    process.exit(1);
  }
  console.log("✓ site_url:", data.site_url ?? SITE_URL);
  console.log("✓ uri_allow_list updated.");
}

async function registerStripeWebhook(stripeKey) {
  console.log("\n▶ Registering Stripe webhook…");

  const listRes = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=100", {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  const list = await listRes.json();
  if (!listRes.ok) {
    console.error("Stripe list webhooks failed:", list);
    process.exit(1);
  }

  const existing = (list.data ?? []).find(
    (w) => w.url === WEBHOOK_URL && w.status !== "disabled",
  );

  if (existing) {
    console.log(`✓ Webhook already exists (${existing.id}).`);
    if (existing.enabled_events?.includes("checkout.session.completed")) {
      console.log("  Event checkout.session.completed is enabled.");
      return existing.secret ? null : existing;
    }
  }

  const createRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      url: WEBHOOK_URL,
      "enabled_events[]": "checkout.session.completed",
      description: "King of Shades — booking payments",
    }),
  });

  const created = await createRes.json();
  if (!createRes.ok) {
    console.error("Stripe webhook create failed:", created);
    process.exit(1);
  }

  console.log(`✓ Webhook created (${created.id}).`);
  console.log("\n⚠ Add this to Vercel as STRIPE_WEBHOOK_SECRET:");
  console.log(`  ${created.secret}`);
  return created;
}

async function verifySchema() {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("\n⚠ Skip schema verify — SUPABASE_SERVICE_ROLE_KEY not set.");
    return false;
  }

  console.log("\n▶ Verifying Phase 3 schema…");
  const tables = ["payments", "quote_requests", "blocked_dates"];
  let ok = true;

  for (const table of tables) {
    const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (res.ok) {
      console.log(`  ✓ ${table}`);
    } else {
      console.log(`  ✗ ${table} (${res.status})`);
      ok = false;
    }
  }

  const rpcRes = await fetch(`${url}/rest/v1/rpc/upsert_booking_customer`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      p_name: "__setup_probe__",
      p_email: `probe-${Date.now()}@example.invalid`,
      p_phone: null,
      p_address: null,
    }),
  });

  if (rpcRes.ok || rpcRes.status === 204) {
    console.log("  ✓ upsert_booking_customer RPC");
  } else {
    const err = await rpcRes.text();
    console.log(`  ✗ upsert_booking_customer RPC (${rpcRes.status})`, err.slice(0, 120));
    ok = false;
  }

  return ok;
}

async function verifyProductionSite() {
  console.log("\n▶ Smoke-testing production routes…");
  const routes = [
    "/booking",
    "/booking/confirmation",
    "/contact",
    "/quote",
    "/portal/login",
    "/api/stripe/webhook",
  ];

  for (const path of routes) {
    try {
      const res = await fetch(`${SITE_URL}${path}`, { redirect: "follow" });
      const label =
        path === "/api/stripe/webhook"
          ? res.status === 405 || res.status === 503
            ? "✓"
            : "?"
          : res.ok
            ? "✓"
            : "✗";
      console.log(`  ${label} ${path} → ${res.status}`);
    } catch (err) {
      console.log(`  ✗ ${path} → ${err.message}`);
    }
  }
}

function printVercelChecklist() {
  console.log("\n▶ Vercel env vars checklist (Settings → Environment Variables → Production):");
  for (const name of REQUIRED_VERCEL_VARS) {
    const local = env[name] ? "set locally" : "missing locally";
    console.log(`  • ${name} — ${local}`);
  }
  console.log("\n  After adding STRIPE_WEBHOOK_SECRET from webhook creation, redeploy on Vercel.");
}

async function main() {
  console.log("King of Shades — Phase 3 production setup\n");

  if (!verifyOnly) {
    const token = env.SUPABASE_ACCESS_TOKEN?.trim();
    if (!token) {
      console.error(
        "Missing SUPABASE_ACCESS_TOKEN.\n" +
          "Get one at https://supabase.com/dashboard/account/tokens\n" +
          "Add to .env.local then re-run: node scripts/setup-production.mjs",
      );
      process.exit(1);
    }

    await runPhase3Migration(token);
    await syncAuthUrls(token);

    if (!migrationOnly) {
      const stripeKey = env.STRIPE_SECRET_KEY?.trim();
      if (stripeKey) {
        await registerStripeWebhook(stripeKey);
      } else {
        console.log("\n⚠ STRIPE_SECRET_KEY not set — skip webhook registration.");
        console.log(`  Manually add webhook: ${WEBHOOK_URL}`);
        console.log("  Event: checkout.session.completed");
      }
    }
  }

  await verifySchema();
  await verifyProductionSite();
  printVercelChecklist();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
