import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryItems, getContentSections, getSiteSettings } from "@/lib/queries/public";
import { getSection, sectionMeta } from "@/lib/cms";
import { toLegacyGalleryItem } from "@/lib/adapters";
import { toSiteConfig } from "@/lib/site-config";
import { galleryItems as mockGallery } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Project Gallery",
  description:
    "Window tint and vinyl projects on cars, homes, and commercial properties across Brigantine and South Jersey.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const [dbItems, sections, settings] = await Promise.all([
    getGalleryItems(),
    getContentSections(),
    getSiteSettings(),
  ]);
  const site = toSiteConfig(settings);
  const pageHeader = getSection(sections, "page_gallery");
  const cta = getSection(sections, "cta_band_gallery");
  const items =
    dbItems.length > 0
      ? dbItems.map((g, i) => toLegacyGalleryItem(g, i))
      : mockGallery;

  return (
    <>
      <PageHeader
        eyebrow={String(sectionMeta(sections, "page_gallery", "eyebrow", ""))}
        title={pageHeader.title ?? ""}
        description={pageHeader.body ?? ""}
      />
      <section className="py-16 sm:py-20">
        <Container>
          <GalleryGrid items={items} />
        </Container>
      </section>
      <CtaBand
        title={cta.title ?? undefined}
        description={cta.body ?? undefined}
        phone={site.phone}
        phoneHref={site.phoneHref}
      />
    </>
  );
}
