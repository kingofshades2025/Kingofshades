import { revalidatePath, revalidateTag } from "next/cache";

/** Shared ISR window for marketing shell + public query cache. */
export const SITE_REVALIDATE_SECONDS = 300;

export const SITE_CACHE_TAGS = {
  all: "site-public",
  settings: "site-settings",
  content: "site-content",
  services: "site-services",
  gallery: "site-gallery",
  testimonials: "site-testimonials",
} as const;

export type SiteCacheTag = keyof typeof SITE_CACHE_TAGS;

/**
 * Bust public marketing caches after admin writes.
 * Uses Next 16 revalidateTag(tag, profile) + layout path revalidation.
 */
export function revalidatePublicMarketing(
  tags: SiteCacheTag[] = ["all"],
) {
  const resolved = new Set<string>([SITE_CACHE_TAGS.all]);
  for (const tag of tags) {
    resolved.add(SITE_CACHE_TAGS[tag]);
  }
  for (const tag of resolved) {
    revalidateTag(tag, "max");
  }
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath("/gallery");
  revalidatePath("/contact");
  revalidatePath("/booking");
  revalidatePath("/privacy");
  revalidatePath("/terms");
}
