import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/sections/PageHeader";
import { ReviewForm } from "@/components/review/ReviewForm";
import { getAppointmentForReview } from "@/lib/queries/review";

export const metadata: Metadata = {
  title: "Leave a Review",
  description: "Share your King of Shades experience.",
  robots: { index: false, follow: false },
};

function InviteOnlyMessage({ title, description }: { title: string; description: string }) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>
    </Card>
  );
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <PageHeader title="Reviews are by invitation only" />
        <section className="py-16 sm:py-20">
          <Container>
            <InviteOnlyMessage
              title="Invitation required"
              description="We send a personal review link by email after your service is complete. If you recently picked up your vehicle, check your inbox for a message from King of Shades."
            />
          </Container>
        </section>
      </>
    );
  }

  const result = await getAppointmentForReview(token);

  if (!result.ok) {
    const copy =
      result.reason === "submitted"
        ? {
            title: "Review already submitted",
            description:
              "Thank you — we've already received your feedback for this appointment. Approved reviews appear on our homepage.",
          }
        : {
            title: "Invalid or expired link",
            description:
              "This review link is not valid. Reviews are by invitation only — contact us if you believe this is an error.",
          };

    return (
      <>
        <PageHeader title="Reviews are by invitation only" />
        <section className="py-16 sm:py-20">
          <Container>
            <InviteOnlyMessage title={copy.title} description={copy.description} />
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Customer feedback"
        title="Leave a review"
        description="Your vehicle is ready — we'd love to hear how we did."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <ReviewForm appointment={result.appointment} token={token} />
        </Container>
      </section>
    </>
  );
}
