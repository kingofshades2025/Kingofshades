/** Production site URL (used in auth redirects and email links). */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://kingofshadesnj.com";

/** Shared secret for server → Supabase email edge function (not a public API key). */
export const EMAIL_FUNCTION_SECRET =
  process.env.EMAIL_FUNCTION_SECRET?.trim() || "kos-email-gate-2026";
