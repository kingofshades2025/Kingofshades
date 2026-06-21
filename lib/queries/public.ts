import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mergeContentSections, getStats, getFeatureStrip, getWhyChoose, getProcessSteps } from "@/lib/cms";
import { services as mockServices, testimonials as mockTestimonials, galleryItems as mockGallery } from "@/lib/data";
import { site as fallbackSite } from "@/lib/site";
import type {
  Service,
  Testimonial,
  GalleryItem,
  SiteSettings,
  ContentSection,
  GalleryCategory,
} from "@/lib/types/database";

const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  business_name: "King of Shades",
  phone: fallbackSite.phone,
  email: fallbackSite.email,
  address_line1: fallbackSite.address.line1,
  address_line2: fallbackSite.address.line2,
  social_links: [...fallbackSite.socials],
  business_hours: [...fallbackSite.hours],
  updated_at: new Date().toISOString(),
};

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) {
    return mockServices.map((s, i) => ({
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data?.length) {
    return mockServices.map((s, i) => ({
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
  return data as Service[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    return mockTestimonials.map((t, i) => ({
      id: String(i),
      customer_name: t.name,
      role: t.role,
      review: t.quote,
      rating: t.rating,
      is_approved: true,
      sort_order: i,
      created_at: new Date().toISOString(),
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_approved", true)
    .order("sort_order");

  if (!data?.length) {
    return mockTestimonials.map((t, i) => ({
      id: String(i),
      customer_name: t.name,
      role: t.role,
      review: t.quote,
      rating: t.rating,
      is_approved: true,
      sort_order: i,
      created_at: new Date().toISOString(),
    }));
  }
  return data as Testimonial[];
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured()) {
    return mockGallery.map((g) => ({
      id: String(g.id),
      image_url: null,
      category: g.category as GalleryCategory,
      title: g.title,
      description: g.detail,
      tint: g.tint ?? null,
      sort_order: g.id,
      created_at: new Date().toISOString(),
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order");

  if (!data?.length) {
    return mockGallery.map((g) => ({
      id: String(g.id),
      image_url: null,
      category: g.category as GalleryCategory,
      title: g.title,
      description: g.detail,
      tint: g.tint ?? null,
      sort_order: g.id,
      created_at: new Date().toISOString(),
    }));
  }
  return data as GalleryItem[];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;

  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  return (data as SiteSettings) ?? DEFAULT_SETTINGS;
}

export async function getContentSections(): Promise<Record<string, ContentSection>> {
  if (!isSupabaseConfigured()) return mergeContentSections([]);

  const supabase = await createClient();
  const { data } = await supabase.from("content_sections").select("*");

  return mergeContentSections((data ?? []) as ContentSection[]);
}

export async function getHomepageContent() {
  const sections = await getContentSections();

  return {
    sections,
    stats: getStats(sections),
    featureStrip: getFeatureStrip(sections),
    whyChoose: getWhyChoose(sections),
    processSteps: getProcessSteps(sections),
  };
}

export async function getBookingServices() {
  const services = await getServices();
  const iconMap: Record<string, string> = {
    automotive: "car",
    residential: "home",
    commercial: "building",
    decals: "sticker",
  };
  const titleMap: Record<string, string> = {
    automotive: "Automotive",
    residential: "Residential",
    commercial: "Commercial",
    decals: "Decals & Vinyl",
  };
  return services.map((s) => ({
    id: s.slug,
    title: titleMap[s.slug] ?? s.title,
    description: s.tagline ?? "",
    icon: iconMap[s.slug] ?? "car",
    from: s.price_label ?? "Quote",
  }));
}
