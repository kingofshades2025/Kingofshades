"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import type { QuoteRequest, QuoteStatus } from "@/lib/types/database";

import { updateQuoteStatus } from "@/app/actions/admin";

import { AdminFeedback } from "@/components/admin/AdminFeedback";

import { AdminPageHeader } from "@/components/admin/AdminUI";

import { UploadedFilesGallery } from "@/components/ui/ClientFileUpload";

import { Button } from "@/components/ui/Button";

import { Field, Input } from "@/components/ui/Field";

import { formatMoney } from "@/lib/booking/pricing";

const statuses: QuoteStatus[] = ["new", "reviewing", "quote_sent", "approved", "rejected"];

export function QuotesManager({
  quotes,
  highlightId,
}: {
  quotes: QuoteRequest[];
  highlightId?: string;
}) {
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      quotes.map((q) => [
        q.id,
        q.quoted_amount_cents ? (q.quoted_amount_cents / 100).toFixed(2) : "",
      ]),
    ),
  );

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const highlightedQuote = highlightId
    ? quotes.find((q) => q.id === highlightId)
    : undefined;

  useEffect(() => {
    if (!highlightId) return;
    const row = rowRefs.current[highlightId];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = row.querySelector('input[type="number"]') as HTMLInputElement | null;
      input?.focus();
    }
  }, [highlightId, quotes.length]);

  function parseAmountCents(id: string): number | undefined {
    const raw = amounts[id]?.trim();
    if (!raw) return undefined;
    const dollars = Number(raw);
    if (!Number.isFinite(dollars) || dollars <= 0) return undefined;
    return Math.round(dollars * 100);
  }

  function handleStatusChange(id: string, status: QuoteStatus) {
    setMessage(null);
    setError(null);
    const quotedAmountCents = parseAmountCents(id);
    startTransition(async () => {
      const result = await updateQuoteStatus(id, status, quotedAmountCents);
      if (result.success) {
        setMessage(status === "quote_sent" ? "Quote sent and customer emailed." : "Quote updated.");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="Quote requests" subtitle="Review custom project inquiries and send estimates." />
      {highlightedQuote ? (
        <div className="mb-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-snow/90">
          Quoting <span className="font-medium text-white">{highlightedQuote.customer_name}</span>
          {" · "}
          {highlightedQuote.service_type}. Enter the amount and click{" "}
          <span className="font-medium text-gold">quote sent</span> to email a Stripe payment link.
        </div>
      ) : null}
      <AdminFeedback message={message} error={error} className="mb-4" />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface/70">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-mist">
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Service</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Quoted ($)</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {quotes.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-mist">No quote requests yet.</td></tr>
            ) : (
              quotes.map((q) => {
                const isHighlighted = highlightId === q.id;
                return (
                  <tr
                    key={q.id}
                    ref={(el) => {
                      rowRefs.current[q.id] = el;
                    }}
                    className={`align-top hover:bg-white/[0.02] ${isHighlighted ? "bg-gold/5 ring-1 ring-inset ring-gold/50" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{q.customer_name}</p>
                      <p className="text-mist">{q.customer_email}</p>
                      <p className="mt-2 max-w-xs text-xs text-mist">{q.description}</p>
                      {q.photo_urls?.length > 0 && (
                        <div className="mt-3 max-w-xs">
                          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-mist">
                            Attachments ({q.photo_urls.length})
                          </p>
                          <UploadedFilesGallery urls={q.photo_urls} compact />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-snow/85">{q.service_type}</td>
                    <td className="px-5 py-4 capitalize text-snow/85">{q.status.replace("_", " ")}</td>
                    <td className="px-5 py-4">
                      <Field>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={amounts[q.id] ?? ""}
                          onChange={(e) => setAmounts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        />
                      </Field>
                      {q.quoted_amount_cents ? (
                        <p className="mt-1 text-xs text-mist">Saved: {formatMoney(q.quoted_amount_cents)}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {statuses.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={q.status === s ? "primary" : isHighlighted && s === "quote_sent" ? "primary" : "subtle"}
                            disabled={isPending || q.status === s}
                            onClick={() => handleStatusChange(q.id, s)}
                          >
                            {s.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
