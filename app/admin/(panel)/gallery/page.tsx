import type { GalleryItem } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminGallery } from "@/lib/queries/admin";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminGalleryPage() {
  await requireAdmin();

  let items: GalleryItem[] = [];
  if (isSupabaseConfigured()) {
    try {
      items = await getAdminGallery();
    } catch {
      items = [];
    }
  }

  return <GalleryManager items={items} />;
}
