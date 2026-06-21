import type { Service } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminServices } from "@/lib/queries/admin";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminServicesPage() {
  await requireAdmin();

  let services: Service[] = [];
  let loadError: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      services = await getAdminServices();
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : "Could not load services from the database.";
    }
  }

  return <ServicesManager services={services} loadError={loadError} />;
}
