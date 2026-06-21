import type { Testimonial } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminTestimonials } from "@/lib/queries/admin";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  let testimonials: Testimonial[] = [];
  if (isSupabaseConfigured()) {
    try {
      testimonials = await getAdminTestimonials();
    } catch {
      testimonials = [];
    }
  }

  return <TestimonialsManager testimonials={testimonials} />;
}
