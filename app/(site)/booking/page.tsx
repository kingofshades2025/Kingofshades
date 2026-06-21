import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookingServices, getContentSections } from "@/lib/queries/public";
import { getSection, sectionMeta } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your window tint or vinyl appointment online in a few quick steps.",
};

export default async function BookingPage() {
  const [services, sections] = await Promise.all([
    getBookingServices(),
    getContentSections(),
  ]);
  const page = getSection(sections, "page_booking");

  return (
    <>
      <PageHeader
        eyebrow={String(sectionMeta(sections, "page_booking", "eyebrow", ""))}
        title={page.title ?? ""}
        description={page.body ?? ""}
      />
      <section className="py-16 sm:py-20">
        <Container>
          <BookingWizard services={services} />
        </Container>
      </section>
    </>
  );
}
