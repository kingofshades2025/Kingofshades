import type { Service as DbService, GalleryItem as DbGalleryItem, Testimonial as DbTestimonial } from "@/lib/types/database";
import type { Service as LegacyService, GalleryItem as LegacyGalleryItem, Testimonial as LegacyTestimonial } from "@/lib/data";

export function toLegacyService(s: DbService): LegacyService {
  return {
    slug: s.slug,
    title: s.title,
    tagline: s.tagline ?? "",
    description: s.description ?? "",
    benefits: s.benefits,
    startingAt: s.price_label ?? "Quote",
    features: s.features,
    accent: (s.accent ?? s.category) as LegacyService["accent"],
    featuredImageUrl: s.featured_image_url ?? undefined,
    detailImageUrl: s.detail_image_url ?? undefined,
    finishImageUrl: s.finish_image_url ?? undefined,
  };
}

export function toLegacyGalleryItem(g: DbGalleryItem, index = 0): LegacyGalleryItem {
  return {
    id: index + 1,
    title: g.title,
    category: g.category as LegacyGalleryItem["category"],
    detail: g.description ?? "",
    tint: g.tint ?? undefined,
    imageUrl: g.image_url ?? undefined,
  };
}

export function toLegacyTestimonial(t: DbTestimonial): LegacyTestimonial {
  return {
    name: t.customer_name,
    role: t.role ?? "",
    quote: t.review,
    rating: t.rating,
  };
}
