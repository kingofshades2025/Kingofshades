import { buildLocalBusinessJsonLd } from "@/lib/seo";
import type { SiteConfig } from "@/lib/site-config";

export function LocalBusinessJsonLd({
  site,
  services,
}: {
  site: SiteConfig;
  services: { slug: string; title: string; description?: string | null }[];
}) {
  const json = JSON.stringify(buildLocalBusinessJsonLd(site, services)).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
