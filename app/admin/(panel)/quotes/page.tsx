import { requireAdmin } from "@/lib/auth/admin";
import { getAdminQuotes } from "@/lib/queries/admin";
import { QuotesManager } from "@/components/admin/QuotesManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireAdmin();
  const { id: highlightId } = await searchParams;
  let quotes: Awaited<ReturnType<typeof getAdminQuotes>> = [];
  if (isSupabaseConfigured()) {
    try {
      quotes = await getAdminQuotes();
    } catch {
      quotes = [];
    }
  }
  return <QuotesManager quotes={quotes} highlightId={highlightId} />;
}
