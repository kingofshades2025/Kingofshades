import type { SiteSettings } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSiteSettings } from "@/lib/queries/admin";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  await requireAdmin();

  let settings: SiteSettings | null = null;
  if (isSupabaseConfigured()) {
    try {
      settings = await getAdminSiteSettings();
    } catch {
      /* use empty defaults */
    }
  }

  return <SettingsManager settings={settings} />;
}
