import type { SiteSettings, ContentSection } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSiteSettings, getAdminContentSections } from "@/lib/queries/admin";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  await requireAdmin();

  let settings: SiteSettings | null = null;
  let sections: ContentSection[] = [];
  if (isSupabaseConfigured()) {
    try {
      [settings, sections] = await Promise.all([
        getAdminSiteSettings(),
        getAdminContentSections(),
      ]);
    } catch {
      /* use empty defaults */
    }
  }

  return <SettingsManager settings={settings} sections={sections} />;
}
