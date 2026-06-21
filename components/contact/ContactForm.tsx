"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/30 bg-gold/5 px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-white">
          Thanks — we&apos;ll be in touch!
        </h3>
        <p className="mt-2 max-w-sm text-sm text-mist">
          Your message was sent successfully. Check your inbox for a confirmation
          email — we&apos;ll respond within one business day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await submitContact(formData);
          if (result.success) {
            setSent(true);
          } else {
            setError(result.error);
          }
        });
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field label="Full name">
        <Input name="name" required placeholder="Jordan Carter" disabled={isPending} />
      </Field>
      <Field label="Phone number">
        <Input name="phone" type="tel" placeholder="(555) 123-4567" disabled={isPending} />
      </Field>
      <Field label="Email address" className="sm:col-span-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          disabled={isPending}
        />
      </Field>
      <Field label="Service of interest" className="sm:col-span-2">
        <Select name="service" defaultValue="" disabled={isPending}>
          <option value="" disabled>
            Select a service…
          </option>
          <option>Automotive Window Tinting</option>
          <option>Residential Window Tinting</option>
          <option>Commercial Window Tinting</option>
          <option>Decals & Vinyl Graphics</option>
          <option>Other / Not sure</option>
        </Select>
      </Field>
      <Field label="Message" className="sm:col-span-2">
        <Textarea
          name="message"
          required
          placeholder="Tell us about your vehicle or project…"
          disabled={isPending}
        />
      </Field>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:col-span-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
          <Send className="h-4 w-4" />
          {isPending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
