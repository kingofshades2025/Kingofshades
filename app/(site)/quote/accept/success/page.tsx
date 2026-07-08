import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  getAppointmentByCheckoutSession,
  getAppointmentForQuoteConfirm,
} from "@/lib/queries/quote-confirm";
import { formatMoney } from "@/lib/booking/pricing";

export default async function QuoteAcceptSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session_id?: string }>;
}) {
  const { token, session_id: sessionId } = await searchParams;

  let appointment = sessionId ? await getAppointmentByCheckoutSession(sessionId) : null;
  if (!appointment && token) {
    const byToken = await getAppointmentForQuoteConfirm(token);
    if (byToken.ok) appointment = byToken.appointment;
  }

  return (
    <>
      <PageHeader title="Quote confirmed" />
      <section className="py-16 sm:py-20">
        <Container>
          <Card className="mx-auto max-w-xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-6 font-display text-2xl font-semibold text-white">Payment received!</h2>

            {appointment ? (
              <>
                {appointment.appointment_number && (
                  <p className="mt-2 font-mono text-sm text-gold">#{appointment.appointment_number}</p>
                )}
                <p className="mt-4 text-sm text-mist">
                  {appointment.service_title}
                  <br />
                  {appointment.appointment_date} at {appointment.appointment_time}
                </p>
                {appointment.quote_amount_cents != null && appointment.quote_amount_cents > 0 && (
                  <p className="mt-2 text-sm text-snow">Paid: {formatMoney(appointment.quote_amount_cents)}</p>
                )}
                <p className="mt-3 text-sm text-mist">
                  Your appointment is confirmed. We&apos;ll see you soon!
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-mist">
                Your payment was received and your appointment is confirmed. Check your email for details.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/">Back to home</Button>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
