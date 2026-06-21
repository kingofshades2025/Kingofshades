#!/usr/bin/env node
/**
 * Full Resend production setup from .env.local:
 * - Creates a new sending API key if RESEND_ADMIN_KEY is set (full-access key)
 * - Updates .env.local
 * - Syncs Shady Boys Vercel env if VERCEL_TOKEN is set
 * - Prints Supabase edge function redeploy reminder
 *
 * Usage (with existing sending key only — sync/test):
 *   node scripts/setup-resend-production.mjs
 *
 * Usage (rotate + sync):
 *   set RESEND_ADMIN_KEY=re_full_access_key
 *   set VERCEL_TOKEN=your_shady_boys_token
 *   node scripts/setup-resend-production.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envFile = join(root, ".env.local");

const TEAM_ID = "team_fWC0CAuS2gFzrgsUomKY8KxC";
const PROJECT_ID = "prj_DT39IZzN4RWmv27PdpKCgRupOik5";

function loadEnvFile() {
  const raw = readFileSync(envFile, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const vars = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) continue;
    vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
  return vars;
}

function saveResendKey(newKey) {
  const content = readFileSync(envFile, "utf8");
  writeFileSync(
    envFile,
    content.replace(/^RESEND_API_KEY=.*$/m, `RESEND_API_KEY=${newKey}`),
    "utf8",
  );
}

async function createSendingKey(adminKey) {
  const resend = new Resend(adminKey);
  const { data: domains, error: domainError } = await resend.domains.list();
  if (domainError) throw new Error(domainError.message);

  const domain = domains?.data?.find((d) =>
    d.name?.includes("kingofshadesnj.com"),
  );
  const params = {
    name: `King of Shades Production ${new Date().toISOString().slice(0, 10)}`,
    permission: "sending_access",
  };
  if (domain?.id) params.domainId = domain.id;

  const { data, error } = await resend.apiKeys.create(params);
  if (error) throw new Error(error.message);
  if (!data?.token) throw new Error("No token returned from Resend");
  return { token: data.token, id: data.id };
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
      type: key.includes("KEY") || key.includes("SECRET") ? "encrypted" : "plain",
      target: [target],
    }),
  });

  if (!res.ok) {
    throw new Error(`${key} (${target}): ${res.status} ${await res.text()}`);
  }
}

async function syncVercel(vars) {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    console.log("⊘ Skipped Vercel sync — set VERCEL_TOKEN (Shady Boys account)");
    return;
  }

  const names = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "EMAIL_TO",
    "NEXT_PUBLIC_APP_URL",
    "EMAIL_FUNCTION_SECRET",
  ];

  for (const target of ["production", "preview", "development"]) {
    for (const name of names) {
      const value = vars[name] ?? "kos-email-gate-2026";
      await upsertVercelEnv(token, name, value, target);
      console.log(`✓ Vercel ${name} (${target})`);
    }
  }
}

async function testSend(key, from, to) {
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "King of Shades — Resend production setup OK",
    html: "<p>Your Resend integration is working.</p>",
  });
  if (error) throw new Error(error.message);
  console.log(`✓ Test email sent (${data?.id})`);
}

async function main() {
  const vars = loadEnvFile();
  let resendKey = vars.RESEND_API_KEY;
  const adminKey = process.env.RESEND_ADMIN_KEY?.trim();

  if (adminKey) {
    console.log("Creating new sending API key via Resend admin key...");
    const created = await createSendingKey(adminKey);
    resendKey = created.token;
    saveResendKey(resendKey);
    vars.RESEND_API_KEY = resendKey;
    console.log(`✓ New key created (${created.id}) and saved to .env.local`);
    console.log("  Delete old keys in https://resend.com/api-keys after verifying email.");
  } else {
    console.log("Using existing RESEND_API_KEY from .env.local");
    console.log("  Tip: set RESEND_ADMIN_KEY to auto-create a rotated sending key.");
  }

  if (!vars.EMAIL_FUNCTION_SECRET) vars.EMAIL_FUNCTION_SECRET = "kos-email-gate-2026";

  if (!resendKey?.startsWith("re_")) {
    throw new Error(`Invalid RESEND_API_KEY in .env.local (${String(resendKey)})`);
  }

  await syncVercel(vars);
  await testSend(
    resendKey,
    vars.EMAIL_FROM ?? "King of Shades <contact@kingofshadesnj.com>",
    vars.EMAIL_TO ?? "kingofshades2025@gmail.com",
  );

  console.log("\nNext: redeploy Supabase send-email edge function with the new key (ask Cursor Supabase MCP).");
  console.log("Test site: https://www.kingofshadesnj.com/contact");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
