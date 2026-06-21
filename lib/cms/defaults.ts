import type { ContentSection } from "@/lib/types/database";

export type CmsStat = { label: string; value: string };
export type CmsFeatureStrip = { label: string; icon: string };
export type CmsWhyChoose = { title: string; description: string; icon: string };
export type CmsProcessStep = { step: string; title: string; description: string };
export type CmsCard = { title: string; text: string };

function section(
  section_key: string,
  title: string | null,
  body: string | null,
  metadata: Record<string, unknown> = {},
): ContentSection {
  return {
    id: section_key,
    section_key,
    title,
    body,
    metadata,
    updated_at: "",
  };
}

export const DEFAULT_CONTENT_SECTIONS: Record<string, ContentSection> = {
  hero_badge: section("hero_badge", "Rated 5 stars by 2,100+ drivers", null),
  hero_title: section("hero_title", "The Royal Standard in Window Tinting", null, {
    highlight: "Window Tinting",
  }),
  hero_subtitle: section(
    "hero_subtitle",
    null,
    "Premium automotive, residential, and commercial tint plus custom vinyl — installed by certified technicians and backed by a lifetime warranty.",
  ),
  hero_card_left: section("hero_card_left", "Up to 88%", "Infrared heat rejected", {
    icon: "snowflake",
  }),
  hero_card_right: section("hero_card_right", "99% UV", "Blocked", {
    icon: "shield",
  }),
  hero_visual: section(
    "hero_visual",
    "Precision-cut, bubble-free finish",
    "Nano-ceramic heat rejection",
    { badge: "Ceramic 20%" },
  ),
  homepage_stats: section("homepage_stats", null, null, {
    items: [
      { label: "Vehicles Tinted", value: "12,400+" },
      { label: "5-Star Reviews", value: "2,100+" },
      { label: "Years in Business", value: "15" },
      { label: "Warranty", value: "Lifetime" },
    ] satisfies CmsStat[],
  }),
  feature_strip: section("feature_strip", null, null, {
    items: [
      { label: "UV Protection", icon: "sun" },
      { label: "Heat Rejection", icon: "snowflake" },
      { label: "Glare Reduction", icon: "eye" },
      { label: "Lifetime Warranty", icon: "shield" },
    ] satisfies CmsFeatureStrip[],
  }),
  about_section: section(
    "about_section",
    "A tint shop obsessed with the details",
    "King of Shades was founded on one belief: tinting is craftsmanship, not a commodity. Every piece of film is computer-cut and hand-applied in our dust-controlled bays, then inspected to a standard most shops never reach.",
    {
      eyebrow: "Who We Are",
      bullets: [
        "Manufacturer-certified installers",
        "Premium ceramic & carbon films only",
        "Transparent, itemized pricing",
        "Lifetime workmanship warranty",
      ],
      visual_label: "15 years of flawless installs",
      visual_sublabel: "Dust-controlled install bays",
      stat_value: "12k+",
      stat_label: "Vehicles tinted",
    },
  ),
  services_section: section(
    "services_section",
    "Tint solutions for every surface",
    "From show cars to storefronts, we have a film and a finish for the job.",
    { eyebrow: "What We Do" },
  ),
  why_choose_section: section(
    "why_choose_section",
    "The difference is in the finish",
    "Anyone can stick film on glass. We deliver a result you'll be proud of for as long as you own it.",
    {
      eyebrow: "Why King of Shades",
      items: [
        {
          title: "Lifetime Warranty",
          description:
            "Every install is backed by a lifetime workmanship guarantee against bubbling, peeling, and fading.",
          icon: "shield",
        },
        {
          title: "Certified Installers",
          description:
            "Factory-trained, manufacturer-certified technicians with thousands of flawless installs.",
          icon: "badge",
        },
        {
          title: "Premium Films Only",
          description:
            "We exclusively use top-tier nano-ceramic and carbon films — never cheap dyed alternatives.",
          icon: "gem",
        },
        {
          title: "Same-Week Booking",
          description:
            "Fast scheduling and most vehicles completed in a single visit, often the same day.",
          icon: "clock",
        },
      ] satisfies CmsWhyChoose[],
    },
  ),
  before_after_section: section(
    "before_after_section",
    "Before & after",
    "Drag the slider to reveal how our film tames glare and heat while elevating the look.",
    {
      eyebrow: "See the Difference",
      slider_label: "Automotive — Ceramic 20%",
      cards: [
        { title: "Glare gone", text: "Harsh reflections cut for safer, easier driving." },
        { title: "Cooler cabin", text: "Surface temps drop dramatically in direct sun." },
        { title: "Refined look", text: "A clean, uniform shade that complements any build." },
      ] satisfies CmsCard[],
    },
  ),
  process_section: section(
    "process_section",
    "A simple, four-step process",
    null,
    {
      eyebrow: "How It Works",
      steps: [
        {
          step: "01",
          title: "Consult & Quote",
          description: "Tell us your goals and get a transparent, itemized estimate.",
        },
        {
          step: "02",
          title: "Choose Your Film",
          description: "Pick the perfect shade and performance tier with expert guidance.",
        },
        {
          step: "03",
          title: "Precision Install",
          description: "Computer-cut film applied in our dust-controlled install bays.",
        },
        {
          step: "04",
          title: "Cure & Enjoy",
          description: "Drive away with care instructions and a lifetime warranty.",
        },
      ] satisfies CmsProcessStep[],
    },
  ),
  testimonials_section: section(
    "testimonials_section",
    "Trusted by thousands of drivers & owners",
    null,
    {
      eyebrow: "Customer Love",
      rating_text: "4.9 average · 2,100+ reviews",
    },
  ),
  cta_band: section(
    "cta_band",
    "Ready to upgrade your shade?",
    "Book your appointment online or request a free, no-obligation quote. Most vehicles done same day.",
  ),
  cta_band_gallery: section(
    "cta_band_gallery",
    "Want your ride in our gallery?",
    "Book your install and join thousands of clean, cool, and protected vehicles and properties.",
  ),
  footer_tagline: section(
    "footer_tagline",
    null,
    "Premium automotive, residential, and commercial window tinting plus custom decals and vinyl graphics — installed by certified pros and backed for life.",
  ),
  page_services: section(
    "page_services",
    "Premium film for every surface",
    "Whether it's a single windshield or an entire commercial facade, we match the right film to your goals — heat, privacy, security, or pure style.",
    { eyebrow: "Our Services" },
  ),
  page_services_cta: section(
    "page_services_cta",
    "Not sure which film is right for you?",
    "Tell us about your vehicle or property and we'll recommend the perfect film and shade — free of charge.",
  ),
  page_gallery: section(
    "page_gallery",
    "A gallery of flawless finishes",
    "Real projects across cars, trucks, SUVs, homes, businesses, and custom vinyl.",
    { eyebrow: "Our Work" },
  ),
  page_contact: section(
    "page_contact",
    "Let's talk shade",
    "Questions, quotes, or fleet inquiries — reach out and our team will get right back to you.",
    {
      eyebrow: "Contact Us",
      form_title: "Send us a message",
      form_subtitle: "Fill out the form and we'll respond within one business hour.",
    },
  ),
  page_booking: section(
    "page_booking",
    "Schedule your install",
    "Five quick steps to request your appointment. We'll confirm by email.",
    { eyebrow: "Book Appointment" },
  ),
};

export const CONTENT_SECTION_KEYS = Object.keys(DEFAULT_CONTENT_SECTIONS);
