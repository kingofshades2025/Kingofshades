"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Star } from "lucide-react";
import { submitReview } from "@/app/actions/review";
import type { ReviewAppointment } from "@/lib/queries/review";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className="rounded p-0.5 transition-colors disabled:opacity-50"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-checked={value === star}
            role="radio"
          >
            <Star
              className={cn(
                "h-8 w-8",
                active ? "fill-gold text-gold" : "fill-transparent text-line",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({
  appointment,
  token,
}: {
  appointment: ReviewAppointment;
  token: string;
}) {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-white">Thank you!</h2>
        <p className="mt-2 text-sm text-mist">
          Your review was submitted and will appear on our site after we approve it.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-8">
      <p className="text-sm text-mist">
        {appointment.appointment_number
          ? `Appointment ${appointment.appointment_number}`
          : appointment.service_title}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-white">Share your experience</h2>
      <p className="mt-2 text-sm text-mist">
        Tell us how your tint or vinyl project turned out — your feedback helps other customers.
      </p>

      <form
        className="mt-8 grid gap-5"
        action={(formData) => {
          setError(null);
          formData.set("token", token);
          formData.set("rating", String(rating));
          startTransition(async () => {
            const result = await submitReview(formData);
            if (result.success) {
              setSent(true);
            } else {
              setError(result.error);
            }
          });
        }}
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="rating" value={rating} />

        <Field label="Your name">
          <Input
            name="customer_name"
            required
            defaultValue={appointment.customer_name}
            disabled={isPending}
          />
        </Field>

        <Field label="Rating">
          <StarRating value={rating} onChange={setRating} disabled={isPending} />
        </Field>

        <Field label="Your review">
          <Textarea
            name="review"
            required
            rows={5}
            placeholder="What did you think of the service, quality, and experience?"
            disabled={isPending}
          />
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={isPending || rating < 1}>
          {isPending ? "Submitting…" : "Submit review"}
        </Button>
      </form>
    </Card>
  );
}
