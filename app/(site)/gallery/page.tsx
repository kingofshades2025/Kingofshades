import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse our portfolio of automotive, residential, commercial tinting and custom decal projects.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Work"
        title="A gallery of flawless finishes"
        description="Real projects across cars, trucks, SUVs, homes, businesses, and custom vinyl. Filter by category and tap any project to take a closer look."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <GalleryGrid />
        </Container>
      </section>
      <CtaBand
        title="Want your ride in our gallery?"
        description="Book your install and join thousands of clean, cool, and protected vehicles and properties."
      />
    </>
  );
}
