import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookingServices } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your window tint or vinyl appointment online in a few quick steps.",
};

export default async function BookingPage() {
  const services = await getBookingServices();

  return (
    <>
      <PageHeader
        eyebrow="Book Appointment"
        title="Schedule your install"
        description="Five quick steps to request your appointment. We'll confirm by email."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <BookingWizard services={services} />
        </Container>
      </section>
    </>
  );
}
