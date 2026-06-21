#!/usr/bin/env node
/**
 * Sync env vars to the Shady Boys Vercel project (serves kingofshadesnj.com).
 *
 * Requires a Vercel token from the Shady Boys account:
 *   https://vercel.com/account/tokens
 *
 * Usage:
 *   set VERCEL_TOKEN=your_token
 *   node scripts/sync-shady-boys-env-api.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envFile = join(root, ".env.local");

const TEAM_ID = "team_fWC0CAuS2gFzrgsUomKY8KxC";
const PROJECT_ID = "prj_DT39IZzN4RWmv27PdpKCgRupOik5";

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
  "NEXT_PUBLIC_APP_URL",
  "EMAIL_FUNCTION_SECRET",
];

function loadEnv() {
  const raw = readFileSync(envFile, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const vars = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) continue;
    vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
  return vars;
}

async function upsertEnv(token, key, value, target) {
  const url = new URL(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env`,
  );
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
      type: key.includes("KEY") || key.includes("SECRET") ? "encrypted" : "plain",
      target: [target],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed ${key} (${target}): ${res.status} ${body}`);
  }
}

async function main() {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    console.error("Set VERCEL_TOKEN from https://vercel.com/account/tokens (Shady Boys account)");
    process.exit(1);
  }

  const vars = loadEnv();
  for (const name of REQUIRED) {
    if (!vars[name]) {
      console.error(`Missing ${name} in .env.local`);
      process.exit(1);
    }
  }

  if (!vars.EMAIL_FUNCTION_SECRET) {
    vars.EMAIL_FUNCTION_SECRET = "kos-email-gate-2026";
  }

  for (const target of ["production", "preview", "development"]) {
    for (const name of REQUIRED) {
      await upsertEnv(token, name, vars[name], target);
      console.log(`✓ ${name} (${target})`);
    }
  }

  console.log("\nDone. Redeploy production from Vercel dashboard or push to main.");
  console.log("Test: https://www.kingofshadesnj.com/contact");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
