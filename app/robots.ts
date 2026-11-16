import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/portal",
        "/auth",
        "/api",
        "/review",
        "/quote/accept",
        "/booking/confirmation",
      ],
    },
    sitemap: `${getSiteBaseUrl()}/sitemap.xml`,
  };
}
