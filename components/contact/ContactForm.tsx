"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/30 bg-gold/5 px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-white">
          Thanks — we'll be in touch!
        </h3>
        <p className="mt-2 max-w-sm text-sm text-mist">
          This is a Phase 1 prototype, so no message was actually sent. In
          production this would reach our team within one business hour.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field label="Full name">
        <Input required placeholder="Jordan Carter" />
      </Field>
      <Field label="Phone number">
        <Input type="tel" placeholder="(555) 123-4567" />
      </Field>
      <Field label="Email address" className="sm:col-span-2">
        <Input type="email" required placeholder="you@email.com" />
      </Field>
      <Field label="Service of interest" className="sm:col-span-2">
        <Select defaultValue="">
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
        <Textarea required placeholder="Tell us about your vehicle or project…" />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Send className="h-4 w-4" />
          Send message
        </Button>
      </div>
    </form>
  );
}
