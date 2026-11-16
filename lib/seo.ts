import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/app-url";
import { services as fallbackServices } from "@/lib/data";
import { site } from "@/lib/site";
import type { SiteConfig } from "@/lib/site-config";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const noIndexRobots = { index: false, follow: false } as const;

export function metadataBaseUrl() {
  return new URL(getSiteBaseUrl());
}

/** Titles, descriptions, canonical URLs, and social cards for public pages. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      description,
      url: canonical,
      siteName: site.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "King of Shades — window tinting for cars, homes, and commercial properties in Brigantine and South Jersey",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description,
    },
  };
}

export function servicePageTitle(title: string) {
  return `${title} in Brigantine`;
}

export function servicePageDescription(service: {
  title: string;
  tagline?: string | null;
  description?: string | null;
}) {
  const lead = service.tagline?.trim() || service.description?.trim() || service.title;
  return `${lead} Serving Brigantine and South Jersey.`;
}

type CatalogService = {
  slug: string;
  title: string;
  description?: string | null;
};

type OpeningHours = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

function findWeekday(label: string) {
  const normalized = label.trim().toLowerCase();
  return WEEKDAYS.find((day) => normalized.includes(day.toLowerCase()));
}

function expandDays(label: string) {
  const [startRaw, endRaw] = label.split(/\s*[–—-]\s*/);
  const start = findWeekday(startRaw ?? "");
  if (!start) return [];
  if (!endRaw || endRaw === startRaw) return [start];
  const end = findWeekday(endRaw);
  if (!end) return [start];
  const startIndex = WEEKDAYS.indexOf(start);
  const endIndex = WEEKDAYS.indexOf(end);
  if (endIndex < startIndex) return [start];
  return WEEKDAYS.slice(startIndex, endIndex + 1);
}

function to24Hour(hour: string, minute: string | undefined, meridiem: string) {
  let value = Number(hour) % 12;
  if (meridiem.toUpperCase() === "PM") value += 12;
  return `${String(value).padStart(2, "0")}:${minute ?? "00"}`;
}

export function openingHoursSpecification(
  hours: { day: string; time: string }[],
): OpeningHours[] {
  const specs: OpeningHours[] = [];

  for (const row of hours) {
    if (/closed/i.test(row.time)) continue;
    const match = row.time.match(
      /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i,
    );
    const days = expandDays(row.day);
    if (!match || days.length === 0) continue;
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: to24Hour(match[1], match[2], match[3]),
      closes: to24Hour(match[4], match[5], match[6]),
    });
  }

  return specs;
}

function streetAddress(line1: string) {
  const line = line1.trim();
  if (!line || !/\d/.test(line)) return undefined;
  return line;
}

export function buildLocalBusinessJsonLd(
  config: SiteConfig,
  services: CatalogService[],
) {
  const origin = getSiteBaseUrl();
  const catalog = services.length
    ? services
    : fallbackServices.map((service) => ({
        slug: service.slug,
        title: service.title,
        description: service.description,
      }));
  const hours = openingHoursSpecification(config.hours);
  const street = streetAddress(config.address.line1);
  const sameAs = config.socials.map((link) => link.href).filter((href) => href.startsWith("http"));
  const phone = config.phoneHref.replace(/^tel:/i, "") || config.phone;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${origin}/#business`,
    name: config.name,
    description:
      "Window tinting for cars, homes, and commercial properties, plus custom vinyl graphics, in Brigantine and South Jersey.",
    url: origin,
    knowsAbout: [
      "Automotive window tinting",
      "Residential window tinting",
      "Commercial window tinting",
      "Custom vinyl graphics",
    ],
    telephone: phone,
    email: config.email,
    image: `${origin}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      addressLocality: "Brigantine",
      addressRegion: "NJ",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Brigantine" },
      { "@type": "AdministrativeArea", name: "Atlantic County" },
      { "@type": "AdministrativeArea", name: "South Jersey" },
    ],
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Window tinting and vinyl",
      itemListElement: catalog.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          ...(service.description?.trim()
            ? { description: service.description.trim() }
            : {}),
          url: `${origin}/services/${service.slug}`,
        },
      })),
    },
  };
}
