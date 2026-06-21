import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSiteSettings, getBlockedDates } from "@/lib/queries/admin";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  await requireAdmin();

  let settings = null;
  let blockedDates: Awaited<ReturnType<typeof getBlockedDates>> = [];
  if (isSupabaseConfigured()) {
    try {
      [settings, blockedDates] = await Promise.all([
        getAdminSiteSettings(),
        getBlockedDates(),
      ]);
    } catch {
      /* use empty defaults */
    }
  }

  return <SettingsManager settings={settings} blockedDates={blockedDates} />;
}
