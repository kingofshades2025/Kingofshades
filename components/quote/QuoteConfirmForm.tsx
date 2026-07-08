"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CreditCard, Banknote, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { confirmQuoteCash, createQuoteConfirmCheckout } from "@/app/actions/quote-confirm";
import type { QuoteConfirmAppointment } from "@/lib/queries/quote-confirm";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/booking/pricing";

function quoteLinesForBreakdown(items: QuoteConfirmAppointment["quote_line_items"]) {
  return items.map((item, index) => ({
    id: `line-${index}`,
    label: item.label,
    amountCents: item.amount_cents,
  }));
}

export function QuoteConfirmForm({
  appointment,
  token,
  cancelled,
}: {
  appointment: QuoteConfirmAppointment;
  token: string;
  cancelled?: boolean;
}) {
  const [error, setError] = useState<string | null>(cancelled ? "Payment was cancelled. You can try again below." : null);
  const [confirmedMethod, setConfirmedMethod] = useState<"cash" | "stripe" | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAlreadyConfirmed = appointment.status !== "quote_sent";
  const breakdownLines = quoteLinesForBreakdown(appointment.quote_line_items);
  const totalCents = appointment.quote_amount_cents ?? 0;

  if (isAlreadyConfirmed || confirmedMethod) {
    const method = confirmedMethod ?? appointment.payment_method;
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-white">Appointment confirmed</h2>
        {appointment.appointment_number && (
          <p className="mt-2 font-mono text-sm text-gold">#{appointment.appointment_number}</p>
        )}
        <p className="mt-3 text-sm text-mist">
          {appointment.service_title}
          <br />
          {appointment.appointment_date} at {appointment.appointment_time}
        </p>
        {totalCents > 0 && (
          <p className="mt-2 text-sm text-snow">Quoted total: {formatMoney(totalCents)}</p>
        )}
        <p className="mt-3 text-sm text-mist">
          {method === "cash"
            ? "You'll pay in cash when you arrive at the shop."
            : method === "stripe"
              ? "Your online payment was received. Thank you!"
              : "Your appointment is confirmed. Check your email for details."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/">Back to home</Button>
        </div>
      </Card>
    );
  }

  const handleCash = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmQuoteCash(token);
      if (result.success) {
        setConfirmedMethod("cash");
      } else {
        setError(result.error);
      }
    });
  };

  const handleStripe = () => {
    setError(null);
    startTransition(async () => {
      const result = await createQuoteConfirmCheckout(token);
      if (result.success) {
        window.location.href = result.url;
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Your quote</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-white">
          Hi {appointment.customer_name.split(" ")[0]}, review and confirm
        </h2>
        <p className="mt-2 text-sm text-mist">
          Approve this quote to lock in your appointment. Then choose how you&apos;d like to pay.
        </p>

        <dl className="mt-6 space-y-3 rounded-xl border border-line bg-charcoal-light/40 p-4 text-sm">
          {appointment.appointment_number && (
            <div className="flex justify-between gap-4">
              <dt className="text-mist">Quote #</dt>
              <dd className="font-mono text-snow">{appointment.appointment_number}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-mist">Service</dt>
            <dd className="text-right text-snow">{appointment.service_title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist">Date</dt>
            <dd className="text-snow">{appointment.appointment_date}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mist">Time</dt>
            <dd className="text-snow">{appointment.appointment_time}</dd>
          </div>
          {totalCents > 0 && (
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="font-medium text-snow">Total</dt>
              <dd className="font-display text-lg font-semibold text-gold">{formatMoney(totalCents)}</dd>
            </div>
          )}
        </dl>

        {breakdownLines.length > 0 && (
          <div className="mt-6 rounded-xl border border-line bg-charcoal-light/40 p-4">
            <p className="mb-3 text-sm font-medium text-snow">Quote breakdown</p>
            <PriceBreakdown lines={breakdownLines} />
          </div>
        )}

        {appointment.quote_notes?.trim() && (
          <p className="mt-4 rounded-xl border border-line bg-surface/40 p-4 text-sm leading-relaxed text-mist">
            {appointment.quote_notes}
          </p>
        )}

        {appointment.quote_pdf_url && (
          <a
            href={appointment.quote_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
          >
            <FileText className="h-4 w-4" />
            Download quote PDF
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold text-white">Choose payment method</h3>
        <p className="mt-1 text-sm text-mist">
          Both options confirm your appointment and reserve your time slot.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleStripe}
            disabled={isPending}
            className="group flex flex-col items-start rounded-2xl border border-line bg-charcoal-light/40 p-5 text-left transition hover:border-gold/50 hover:bg-gold/5 disabled:opacity-50"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
              <CreditCard className="h-5 w-5" />
            </span>
            <span className="mt-4 font-medium text-white">Pay online</span>
            <span className="mt-1 text-sm text-mist">
              Secure checkout via Stripe{totalCents > 0 ? ` — ${formatMoney(totalCents)}` : ""}.
            </span>
          </button>

          <button
            type="button"
            onClick={handleCash}
            disabled={isPending}
            className="group flex flex-col items-start rounded-2xl border border-line bg-charcoal-light/40 p-5 text-left transition hover:border-gold/50 hover:bg-gold/5 disabled:opacity-50"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
              <Banknote className="h-5 w-5" />
            </span>
            <span className="mt-4 font-medium text-white">Pay cash at shop</span>
            <span className="mt-1 text-sm text-mist">
              Confirm now and pay when you arrive for your appointment.
            </span>
          </button>
        </div>

        {isPending && (
          <p className="mt-4 text-center text-sm text-mist">Processing…</p>
        )}
      </Card>
    </div>
  );
}
