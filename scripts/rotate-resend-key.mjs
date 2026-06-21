#!/usr/bin/env node
/**
 * Rotate the Resend API key across local env, Vercel, and Supabase email function.
 *
 * Prerequisite: create a new key at https://resend.com/api-keys
 * (requires a full-access Resend key or dashboard access).
 *
 * Usage:
 *   set NEW_RESEND_API_KEY=re_your_new_key
 *   set VERCEL_TOKEN=your_shady_boys_token   (optional, for Shady Boys sync)
 *   node scripts/rotate-resend-key.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envFile = join(root, ".env.local");

const TEAM_ID = "team_fWC0CAuS2gFzrgsUomKY8KxC";
const PROJECT_ID = "prj_DT39IZzN4RWmv27PdpKCgRupOik5";
const PROJECT_REF = "ertxeyopvtoclwkfrmso";

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

function updateEnvLocal(newKey) {
  const raw = readFileSync(envFile, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const updated = raw.replace(/^RESEND_API_KEY=.*$/m, `RESEND_API_KEY=${newKey}`);
  writeFileSync(envFile, updated.split("\n").join(eol), "utf8");
  console.log("✓ Updated .env.local");
}

async function upsertVercelEnv(token, key, value, target) {
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
      type: "encrypted",
      target: [target],
    }),
  });

  if (!res.ok) {
    throw new Error(`Vercel ${key} (${target}): ${res.status} ${await res.text()}`);
  }
}

async function syncShadyBoys(newKey) {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    console.log("⊘ Skipped Shady Boys Vercel sync (set VERCEL_TOKEN to enable)");
    return;
  }

  for (const target of ["production", "preview", "development"]) {
    await upsertVercelEnv(token, "RESEND_API_KEY", newKey, target);
    console.log(`✓ Shady Boys RESEND_API_KEY (${target})`);
  }
}

async function redeployEmailFunction(newKey) {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.log("⊘ Skipped Supabase function redeploy (set SUPABASE_ACCESS_TOKEN to enable)");
    console.log("  Or redeploy send-email from Cursor Supabase MCP after rotation.");
    return;
  }

  const functionSource = readFileSync(
    join(root, "supabase/functions/send-email/index.ts"),
    "utf8",
  );

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/send-email`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: "send-email",
        name: "send-email",
        verify_jwt: false,
        body: functionSource.replace(
          'Deno.env.get("RESEND_API_KEY")',
          `Deno.env.get("RESEND_API_KEY") ?? "${newKey}"`,
        ),
      }),
    },
  );

  if (!res.ok) {
    console.log(`⊘ Supabase function redeploy failed: ${res.status}`);
    return;
  }

  console.log("✓ Redeployed Supabase send-email function");
}

async function main() {
  const newKey = process.env.NEW_RESEND_API_KEY?.trim();
  if (!newKey?.startsWith("re_")) {
    console.error("Set NEW_RESEND_API_KEY to the new Resend key from https://resend.com/api-keys");
    process.exit(1);
  }

  updateEnvLocal(newKey);
  await syncShadyBoys(newKey);
  await redeployEmailFunction(newKey);

  console.log("\nDone. Delete the old key in Resend dashboard after verifying email works.");
  console.log("Test: https://www.kingofshadesnj.com/contact");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
