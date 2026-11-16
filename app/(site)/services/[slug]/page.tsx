import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServices, getContentSections, getSiteSettings } from "@/lib/queries/public";
import { getSection } from "@/lib/cms";
import { toLegacyService } from "@/lib/adapters";
import { toSiteConfig } from "@/lib/site-config";
import { pageMetadata, servicePageDescription, servicePageTitle } from "@/lib/seo";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceSection } from "@/components/services/ServiceSection";

export const revalidate = 300;

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

async function findService(slug: string) {
  const services = await getServices();
  const match = services.find((service) => service.slug === slug);
  return match ? toLegacyService(match) : null;
}

export async function generateStaticParams() {
  const services = await getServices();
  return services
    .filter((service) => service.slug)
    .map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await findService(slug);
  if (!service) {
    return { title: "Service" };
  }

  return pageMetadata({
    title: servicePageTitle(service.title),
    description: servicePageDescription(service),
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, sections, settings] = await Promise.all([
    findService(slug),
    getContentSections(),
    getSiteSettings(),
  ]);

  if (!service) notFound();

  const site = toSiteConfig(settings);
  const pageCta = getSection(sections, "page_services_cta");

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={service.title}
        description={service.tagline}
        size="compact"
      >
        <Link
          href="/services"
          className="text-sm font-medium text-gold transition-colors hover:text-gold-light"
        >
          All services
        </Link>
      </PageHeader>
      <ServiceSection service={service} showHeading={false} />
      <CtaBand
        title={pageCta.title ?? undefined}
        description={pageCta.body ?? undefined}
        phone={site.phone}
        phoneHref={site.phoneHref}
      />
    </>
  );
}
