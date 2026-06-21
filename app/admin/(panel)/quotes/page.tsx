import { requireAdmin } from "@/lib/auth/admin";
import { getAdminQuotes } from "@/lib/queries/admin";
import { QuotesManager } from "@/components/admin/QuotesManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminQuotesPage() {
  await requireAdmin();
  let quotes: Awaited<ReturnType<typeof getAdminQuotes>> = [];
  if (isSupabaseConfigured()) {
    try {
      quotes = await getAdminQuotes();
    } catch {
      quotes = [];
    }
  }
  return <QuotesManager quotes={quotes} />;
}
