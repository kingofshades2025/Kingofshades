"use client";

import { useState, useTransition } from "react";
import type { Appointment } from "@/lib/types/database";
import { sendAppointmentQuote } from "@/app/actions/admin";
import { photoUrlsFromDetails, UploadedFilesGallery } from "@/components/ui/ClientFileUpload";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ExternalLink, FileText } from "lucide-react";
import { formatMoney } from "@/lib/booking/pricing";

function defaultQuoteAmount(appointment: Appointment) {
  const cents = appointment.quote_amount_cents ?? appointment.total_cents;
  return cents && cents > 0 ? (cents / 100).toFixed(2) : "";
}

export function AppointmentQuotePanel({ appointment }: { appointment: Appointment }) {
  const [quoteAmount, setQuoteAmount] = useState(() => defaultQuoteAmount(appointment));
  const [quoteNotes, setQuoteNotes] = useState(appointment.quote_notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const photos = photoUrlsFromDetails(appointment.details);
  const vehicleDetails = Object.entries(appointment.details ?? {}).filter(
    ([key, value]) => key !== "photo_urls" && typeof value === "string" && value.trim(),
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await sendAppointmentQuote(fd);
      if (result.success) {
        setMessage("Quote emailed to client with PDF attached.");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-charcoal-light/40 p-5">
      <div>
        <h4 className="font-display text-base font-semibold text-white">Review & quote</h4>
        <p className="mt-1 text-sm text-mist">
          Verify vehicle details and work needed, then send a formal quote with PDF.
        </p>
      </div>

      {vehicleDetails.length > 0 && (
        <dl className="space-y-2 rounded-xl border border-line bg-surface/40 p-3 text-sm">
          {vehicleDetails.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <dt className="text-mist">{key}</dt>
              <dd className="text-right text-snow">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {photos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mist">Reference photos</p>
          <UploadedFilesGallery urls={photos} />
        </div>
      )}

      {appointment.estimate_line_items && appointment.estimate_line_items.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mist">Client estimate</p>
          <ul className="space-y-1 rounded-xl border border-line bg-surface/40 p-3 text-sm">
            {appointment.estimate_line_items.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex justify-between gap-4 text-snow">
                <span className="text-mist">{item.label}</span>
                <span>{formatMoney(item.amount_cents)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {appointment.quote_pdf_url && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm font-medium text-gold">Quote sent</p>
          {appointment.quote_sent_at && (
            <p className="mt-1 text-xs text-mist">
              {new Date(appointment.quote_sent_at).toLocaleString()}
              {appointment.quote_amount_cents != null && (
                <> · {formatMoney(appointment.quote_amount_cents)}</>
              )}
            </p>
          )}
          <a
            href={appointment.quote_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
          >
            <FileText className="h-4 w-4" />
            View quote PDF
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <Field label="Quote total ($)">
          <Input
            name="quote_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 433.32"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
            required
          />
        </Field>
        <Field label="Notes for client (optional)">
          <Textarea
            name="quote_notes"
            rows={3}
            placeholder="Film choice, prep notes, warranty details…"
            value={quoteNotes}
            onChange={(e) => setQuoteNotes(e.target.value)}
          />
        </Field>
        <p className="text-xs text-mist">
          The email includes a secure link where the client can confirm the quote and choose Stripe or cash payment.
        </p>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Sending quote…" : appointment.quote_pdf_url ? "Resend quote" : "Send quote to client"}
        </Button>
      </form>
    </div>
  );
}
