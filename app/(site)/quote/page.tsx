import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { QuoteRequestForm } from "@/components/quotes/QuoteRequestForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a free custom estimate for automotive, residential, commercial tint, or vinyl graphics.",
};

export default function QuotePage() {
  return (
    <>
      <PageHeader
        size="compact"
        eyebrow="Custom Quote"
        title="Request a free estimate"
        description="Every project is different. Tell us what you need and we'll send a tailored quote."
      />
      <section className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <QuoteRequestForm />
          </div>
        </Container>
      </section>
    </>
  );
}
