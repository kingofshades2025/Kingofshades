#!/usr/bin/env node
/**
 * Phase 3 production configuration — Vercel env, Stripe webhook, Supabase auth URLs.
 *
 * Add to .env.local (or export before running):
 *   VERCEL_TOKEN              — https://vercel.com/account/tokens (Shady Boys account)
 *   SUPABASE_ACCESS_TOKEN     — https://supabase.com/dashboard/account/tokens
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase → Settings → API → service_role
 *   STRIPE_SECRET_KEY         — Stripe → API keys
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe → API keys
 *
 * Usage:
 *   node scripts/configure-phase3-production.mjs
 *   node scripts/configure-phase3-production.mjs --vercel-only
 *   node scripts/configure-phase3-production.mjs --skip-deploy
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TEAM_ID = "team_fWC0CAuS2gFzrgsUomKY8KxC";
const PROJECT_ID = "prj_DT39IZzN4RWmv27PdpKCgRupOik5";
const SUPABASE_PROJECT_REF = "ertxeyopvtoclwkfrmso";
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

const PHASE3_ENV_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
  "NEXT_PUBLIC_APP_URL",
  "EMAIL_FUNCTION_SECRET",
];

function loadEnv() {
  const path = join(root, ".env.local");
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^"|"$/g, "").replace(/\r$/, "");
  }
  return env;
}

async function upsertVercelEnv(token, key, value, target) {
  const url = new URL(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`);
  url.searchParams.set("upsert", "true");
  url.searchParams.set("teamId", TEAM_ID);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: /KEY|SECRET|TOKEN/i.test(key) ? "encrypted" : "plain",
      target: [target],
    }),
  });

  if (!res.ok) {
    throw new Error(`Vercel env ${key} (${target}): ${res.status} ${await res.text()}`);
  }
}

async function syncVercelEnv(env) {
  const token = env.VERCEL_TOKEN?.trim();
  if (!token) throw new Error("Missing VERCEL_TOKEN");

  const values = {
    ...env,
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL || SITE_URL,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || SITE_URL,
    EMAIL_FUNCTION_SECRET: env.EMAIL_FUNCTION_SECRET || "kos-email-gate-2026",
  };

  const missing = PHASE3_ENV_VARS.filter((k) => {
    if (k === "STRIPE_WEBHOOK_SECRET") return false;
    return !values[k]?.trim();
  });

  if (missing.length) {
    throw new Error(`Missing in .env.local: ${missing.join(", ")}`);
  }

  console.log("\n▶ Syncing Vercel environment variables (production)…");
  for (const key of PHASE3_ENV_VARS) {
    if (!values[key]?.trim()) continue;
    await upsertVercelEnv(token, key, values[key].trim(), "production");
    console.log(`  ✓ ${key}`);
  }
}

async function createStripeWebhook(stripeKey) {
  console.log("\n▶ Configuring Stripe webhook…");

  const listRes = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=100", {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  const list = await listRes.json();
  if (!listRes.ok) throw new Error(`Stripe list webhooks: ${JSON.stringify(list)}`);

  const existing = (list.data ?? []).find(
    (w) => w.url === WEBHOOK_URL && w.status !== "disabled",
  );

  if (existing?.enabled_events?.includes("checkout.session.completed")) {
    console.log(`  ✓ Webhook already exists (${existing.id})`);
    return existing.secret ?? null;
  }

  const body = new URLSearchParams({
    url: WEBHOOK_URL,
    description: "King of Shades — booking payments",
    "enabled_events[]": "checkout.session.completed",
  });

  const createRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const created = await createRes.json();
  if (!createRes.ok) throw new Error(`Stripe create webhook: ${JSON.stringify(created)}`);

  console.log(`  ✓ Webhook created (${created.id})`);
  return created.secret;
}

async function syncSupabaseAuth(token) {
  console.log("\n▶ Syncing Supabase auth redirect URLs…");
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
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
  if (!res.ok) throw new Error(`Supabase auth config: ${JSON.stringify(data)}`);
  console.log("  ✓ site_url:", data.site_url ?? SITE_URL);
  console.log("  ✓ redirect URLs updated");
}

async function triggerRedeploy(token) {
  console.log("\n▶ Triggering production redeploy…");
  const url = new URL(`https://api.vercel.com/v13/deployments`);
  url.searchParams.set("teamId", TEAM_ID);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "kingofshades",
      project: PROJECT_ID,
      target: "production",
      gitSource: {
        type: "github",
        org: "kingofshades2025",
        repo: "Kingofshades",
        ref: "main",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.log("  ⚠ Auto-deploy failed — redeploy manually from Vercel dashboard or push to main.");
    console.log("   ", data.message ?? JSON.stringify(data).slice(0, 200));
    return;
  }
  console.log(`  ✓ Deployment started: ${data.url ?? data.id}`);
}

async function main() {
  const flags = new Set(process.argv.slice(2));
  const env = loadEnv();

  console.log("King of Shades — Phase 3 production configuration\n");

  let webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? null;

  if (!flags.has("--vercel-only")) {
    const supabaseToken = env.SUPABASE_ACCESS_TOKEN?.trim();
    if (supabaseToken) {
      await syncSupabaseAuth(supabaseToken);
    } else {
      console.log("\n⚠ Skip Supabase auth — add SUPABASE_ACCESS_TOKEN to .env.local");
    }

    const stripeKey = env.STRIPE_SECRET_KEY?.trim();
    if (stripeKey) {
      webhookSecret = (await createStripeWebhook(stripeKey)) ?? webhookSecret;
      if (webhookSecret && !env.STRIPE_WEBHOOK_SECRET) {
        env.STRIPE_WEBHOOK_SECRET = webhookSecret;
        console.log("\n  → Add to .env.local as STRIPE_WEBHOOK_SECRET:", webhookSecret);
      }
    } else {
      console.log("\n⚠ Skip Stripe webhook — add STRIPE_SECRET_KEY to .env.local");
    }
  }

  const vercelToken = env.VERCEL_TOKEN?.trim();
  if (vercelToken) {
    await syncVercelEnv(env);
    if (!flags.has("--skip-deploy")) {
      await triggerRedeploy(vercelToken);
    }
  } else {
    console.log("\n⚠ Skip Vercel env — add VERCEL_TOKEN to .env.local");
    console.log("  Get one at https://vercel.com/account/tokens (Shady Boys account)");
  }

  console.log("\nDone.");
  console.log("\nVerify:");
  console.log("  • https://www.kingofshadesnj.com/booking");
  console.log("  • https://www.kingofshadesnj.com/portal/login");
  console.log("  • Stripe Dashboard → Webhooks → Events");
}

main().catch((err) => {
  console.error("\n✗", err.message);
  process.exit(1);
});
