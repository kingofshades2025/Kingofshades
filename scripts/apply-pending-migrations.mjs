#!/usr/bin/env node
/**
 * Apply pending Supabase migrations via service role.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const migrations = [
  "20260621044925_grant_table_privileges.sql",
  "20260622164657_phase3_booking_payments.sql",
  "20260622164748_phase3_table_grants.sql",
];

async function runSql(sql) {
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }).catch(() => null);

  if (res?.ok) return;

  // Fallback: use pg via Supabase SQL API isn't available — use direct postgres if needed
  // Use Supabase Management API alternative: run each statement via postgrest won't work for DDL
  // Document manual run instead
  throw new Error("Direct DDL via REST unavailable — run migrations in Supabase SQL Editor");
}

async function main() {
  console.log("Migration files to apply manually in Supabase SQL Editor:\n");
  for (const file of migrations) {
    const sql = readFileSync(join(root, "supabase/migrations", file), "utf8");
    console.log(`--- ${file} ---`);
    console.log(sql);
    console.log("");
  }
  console.log("Also re-run content_sections block from supabase/seed.sql");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
