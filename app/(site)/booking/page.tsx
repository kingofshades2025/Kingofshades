import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your window tint or vinyl appointment online in a few quick steps.",
};

export default function BookingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Book Appointment"
        title="Schedule your install"
        description="Five quick steps to lock in your appointment. This is a Phase 1 prototype — no payment is processed."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <BookingWizard />
        </Container>
      </section>
    </>
  );
}
