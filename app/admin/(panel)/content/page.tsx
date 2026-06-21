import type { ContentSection } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminContentSections } from "@/lib/queries/admin";
import { ContentManager } from "@/components/admin/ContentManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminContentPage() {
  await requireAdmin();

  let sections: ContentSection[] = [];
  if (isSupabaseConfigured()) {
    try {
      sections = await getAdminContentSections();
    } catch {
      /* use defaults in ContentManager */
    }
  }

  return <ContentManager sections={sections} />;
}
