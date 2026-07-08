import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/sections/PageHeader";
import { QuoteConfirmForm } from "@/components/quote/QuoteConfirmForm";
import { getAppointmentForQuoteConfirm } from "@/lib/queries/quote-confirm";

export const metadata: Metadata = {
  title: "Confirm Your Quote",
  description: "Review and confirm your King of Shades service quote.",
  robots: { index: false, follow: false },
};

function MessageCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>
    </Card>
  );
}

export default async function QuoteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; cancelled?: string }>;
}) {
  const { token, cancelled } = await searchParams;

  if (!token) {
    return (
      <>
        <PageHeader title="Quote confirmation" />
        <section className="py-16 sm:py-20">
          <Container>
            <MessageCard
              title="Link required"
              description="We send a personal quote confirmation link by email after reviewing your booking request. Check your inbox for a message from King of Shades."
            />
          </Container>
        </section>
      </>
    );
  }

  const result = await getAppointmentForQuoteConfirm(token);

  if (!result.ok) {
    const copy =
      result.reason === "cancelled"
        ? {
            title: "Appointment cancelled",
            description: "This appointment has been cancelled. Contact us if you have questions.",
          }
        : {
            title: "Invalid or expired link",
            description:
              "This quote link is not valid. If you recently received a quote, check for a newer email or contact the shop.",
          };

    return (
      <>
        <PageHeader title="Quote confirmation" />
        <section className="py-16 sm:py-20">
          <Container>
            <MessageCard title={copy.title} description={copy.description} />
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Quote approval"
        title="Confirm your appointment"
        description="Review your quote and choose how you'd like to pay."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <QuoteConfirmForm
            appointment={result.appointment}
            token={token}
            cancelled={cancelled === "1"}
          />
        </Container>
      </section>
    </>
  );
}
