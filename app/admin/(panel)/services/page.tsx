import type { Service } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminServices } from "@/lib/queries/admin";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { services as mockServices } from "@/lib/data";

export default async function AdminServicesPage() {
  await requireAdmin();

  let services: Service[] = [];
  if (isSupabaseConfigured()) {
    try {
      services = await getAdminServices();
    } catch {
      services = [];
    }
  }

  if (!services.length) {
    services = mockServices.map((s, i) => ({
      id: s.slug,
      slug: s.slug,
      title: s.title,
      tagline: s.tagline,
      description: s.description,
      category: s.accent,
      price_label: s.startingAt,
      price_cents: null,
      benefits: s.benefits,
      features: s.features,
      featured_image_url: null,
      accent: s.accent,
      is_active: true,
      sort_order: i,
      created_at: "",
      updated_at: "",
    }));
  }

  return <ServicesManager services={services} />;
}
