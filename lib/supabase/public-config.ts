/** Public Supabase project URL (safe to embed — exposed via NEXT_PUBLIC_ in builds). */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ertxeyopvtoclwkfrmso.supabase.co";

/** Public anon key (safe to embed — RLS protects data; key is in every client bundle). */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydHhleW9wdnRvY2x3a2ZybXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTYzODAsImV4cCI6MjA5NzU3MjM4MH0.2AbZJHUtrdSUCKCdBzs1gyzbTQ_GVPIAVVZYZEoGTcI";
