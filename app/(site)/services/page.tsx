import type { Metadata } from "next";
import Link from "next/link";
import { getServices, getContentSections, getSiteSettings } from "@/lib/queries/public";
import { getSection, sectionMeta } from "@/lib/cms";
import { toLegacyService } from "@/lib/adapters";
import { toSiteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceSection } from "@/components/services/ServiceSection";

export const metadata: Metadata = pageMetadata({
  title: "Window Tinting for Cars, Homes, and Businesses",
  description:
    "Window tinting for vehicles, homes, and commercial properties, plus custom decals and vinyl graphics, in Brigantine and South Jersey.",
  path: "/services",
});

export default async function ServicesPage() {
  const [dbServices, sections, settings] = await Promise.all([
    getServices(),
    getContentSections(),
    getSiteSettings(),
  ]);
  const site = toSiteConfig(settings);
  const services = dbServices.map(toLegacyService);
  const pageHeader = getSection(sections, "page_services");
  const pageCta = getSection(sections, "page_services_cta");

  return (
    <>
      <PageHeader
        eyebrow={String(sectionMeta(sections, "page_services", "eyebrow", ""))}
        title={pageHeader.title ?? ""}
        description={pageHeader.body ?? ""}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="rounded-full border border-line bg-charcoal-light px-4 py-2 text-sm font-medium text-snow/80 transition-colors hover:border-gold/40 hover:text-gold"
            >
              {service.title.replace(" Window Tinting", "")}
            </Link>
          ))}
        </div>
      </PageHeader>

      {services.map((service, index) => (
        <div key={service.slug} className={index % 2 === 1 ? "bg-charcoal/40" : undefined}>
          <ServiceSection service={service} reversed={index % 2 === 1} />
        </div>
      ))}

      <CtaBand
        title={pageCta.title ?? undefined}
        description={pageCta.body ?? undefined}
        phone={site.phone}
        phoneHref={site.phoneHref}
      />
    </>
  );
}
