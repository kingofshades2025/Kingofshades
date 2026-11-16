import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookingServices, getContentSections } from "@/lib/queries/public";
import { getSection, sectionMeta } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book an Appointment",
  description:
    "Book window tint for a car, home, or commercial property in Brigantine and South Jersey.",
  path: "/booking",
});

export default async function BookingPage() {
  const [services, sections] = await Promise.all([
    getBookingServices(),
    getContentSections(),
  ]);
  const page = getSection(sections, "page_booking");

  return (
    <>
      <PageHeader
        size="compact"
        eyebrow={String(sectionMeta(sections, "page_booking", "eyebrow", ""))}
        title={page.title ?? ""}
        description={page.body ?? ""}
      />
      <section className="py-10 sm:py-14">
        <Container>
          <BookingWizard services={services} />
        </Container>
      </section>
    </>
  );
}
