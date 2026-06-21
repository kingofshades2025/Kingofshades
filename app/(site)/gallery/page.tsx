import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryItems } from "@/lib/queries/public";
import { toLegacyGalleryItem } from "@/lib/adapters";
import { galleryItems as mockGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse our portfolio of automotive, residential, commercial tinting and custom decal projects.",
};

export default async function GalleryPage() {
  const dbItems = await getGalleryItems();
  const items =
    dbItems.length > 0
      ? dbItems.map((g, i) => toLegacyGalleryItem(g, i))
      : mockGallery;

  return (
    <>
      <PageHeader
        eyebrow="Our Work"
        title="A gallery of flawless finishes"
        description="Real projects across cars, trucks, SUVs, homes, businesses, and custom vinyl."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <GalleryGrid items={items} />
        </Container>
      </section>
      <CtaBand
        title="Want your ride in our gallery?"
        description="Book your install and join thousands of clean, cool, and protected vehicles and properties."
      />
    </>
  );
}
