import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { QuoteRequestForm } from "@/components/quotes/QuoteRequestForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Request a Quote",
  description:
    "Request a free estimate for window tint on a car, home, or commercial property, plus vinyl graphics, in Brigantine and South Jersey.",
  path: "/quote",
});

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
