import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/app-url";
import { services as fallbackServices } from "@/lib/data";
import { getServices } from "@/lib/queries/public";

const STATIC_PATHS = [
  "/",
  "/services",
  "/gallery",
  "/contact",
  "/quote",
  "/booking",
  "/privacy",
  "/terms",
] as const;

async function servicePaths() {
  try {
    const services = await getServices();
    const slugs = services.map((service) => service.slug).filter(Boolean);
    if (slugs.length) return slugs.map((slug) => `/services/${slug}`);
  } catch (err) {
    console.error("[sitemap]", err);
  }
  return fallbackServices.map((service) => `/services/${service.slug}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteBaseUrl();
  const paths = [...STATIC_PATHS.slice(0, 2), ...(await servicePaths()), ...STATIC_PATHS.slice(2)];

  return paths.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    changeFrequency: path === "/" || path.startsWith("/services") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/services") ? 0.8 : path === "/privacy" || path === "/terms" ? 0.3 : 0.6,
  }));
}
