"use client";

import { useState, useTransition } from "react";
import { submitQuoteRequest } from "@/app/actions/quotes";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function QuoteRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return submitted ? (
    <div className="rounded-3xl border border-gold/30 bg-gold/5 p-10 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
      <h2 className="mt-4 font-display text-xl font-bold text-white">Quote request sent</h2>
      <p className="mt-2 text-sm text-mist">We&apos;ll review your project and email you a custom estimate.</p>
    </div>
  ) : (
    <form
      className="grid gap-5 rounded-3xl border border-line bg-surface/70 p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await submitQuoteRequest(fd);
          if (result.success) setSubmitted(true);
          else setError(result.error);
        });
      }}
    >
      <Field label="Full name"><Input name="name" required placeholder="Jordan Carter" /></Field>
      <Field label="Email"><Input name="email" type="email" required placeholder="you@email.com" /></Field>
      <Field label="Phone"><Input name="phone" type="tel" placeholder="(555) 123-4567" /></Field>
      <Field label="Service type">
        <Select name="service_type" required defaultValue="">
          <option value="" disabled>Select…</option>
          <option>Automotive Tint</option>
          <option>Residential Tint</option>
          <option>Commercial Tint</option>
          <option>Decals & Vinyl</option>
          <option>Other / Custom</option>
        </Select>
      </Field>
      <Field label="Measurements / dimensions" className="sm:col-span-2">
        <Textarea name="measurements" rows={3} placeholder="Window sizes, vehicle details, square footage…" />
      </Field>
      <Field label="Project description" className="sm:col-span-2">
        <Textarea name="description" required rows={5} placeholder="Tell us about your project, goals, and timeline…" />
      </Field>
      {error && (
        <div className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={isPending}>{isPending ? "Sending…" : "Submit quote request"}</Button>
      </div>
    </form>
  );
}
