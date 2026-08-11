"use client";

import { useState, useTransition } from "react";
import { submitQuoteRequest } from "@/app/actions/quotes";
import { uploadQuoteFiles } from "@/app/actions/uploads";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ClientFileUpload } from "@/components/ui/ClientFileUpload";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function QuoteRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  return submitted ? (
    <div className="rounded-3xl border border-gold/30 bg-gold/5 px-6 py-12 text-center sm:px-10">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold text-white">Quote request sent</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-mist">
        We&apos;ll review your project and email you a custom estimate.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/booking">Book an appointment</Button>
        <Button href="/" variant="outline">
          Back to home
        </Button>
      </div>
    </div>
  ) : (
    <form
      className="grid gap-5 rounded-3xl border border-line bg-surface/70 p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") ?? "").trim();
        const email = String(fd.get("email") ?? "").trim();
        const phone = String(fd.get("phone") ?? "").trim();
        const description = String(fd.get("description") ?? "").trim();
        const serviceType = String(fd.get("service_type") ?? "").trim();
        const digits = phone.replace(/\D/g, "");

        if (!name) {
          setError("Enter your full name.");
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Enter a valid email address.");
          return;
        }
        if (digits.length < 10) {
          setError("Enter a valid 10-digit phone number.");
          return;
        }
        if (!serviceType) {
          setError("Select a service type.");
          return;
        }
        if (!description) {
          setError("Describe your project so we can prepare an estimate.");
          return;
        }

        startTransition(async () => {
          const result = await submitQuoteRequest(fd);
          if (result.success) setSubmitted(true);
          else setError(result.error);
        });
      }}
    >
      <input type="hidden" name="photo_urls" value={JSON.stringify(photoUrls)} />
      <Field label="Full name">
        <Input name="name" required placeholder="Jordan Carter" autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Phone">
        <Input
          name="phone"
          type="tel"
          required
          placeholder="(609) 555-0123"
          autoComplete="tel"
        />
      </Field>
      <Field label="Service type">
        <Select name="service_type" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option>Automotive Tint</option>
          <option>Residential Tint</option>
          <option>Commercial Tint</option>
          <option>Decals & Vinyl</option>
          <option>Other / Custom</option>
        </Select>
      </Field>
      <Field label="Measurements / dimensions" className="sm:col-span-2">
        <Textarea
          name="measurements"
          rows={3}
          placeholder="Window sizes, vehicle details, square footage…"
        />
      </Field>
      <Field label="Project description" className="sm:col-span-2">
        <Textarea
          name="description"
          required
          rows={5}
          placeholder="Tell us about your project, goals, and timeline…"
        />
      </Field>
      <ClientFileUpload
        value={photoUrls}
        onChange={setPhotoUrls}
        uploadAction={uploadQuoteFiles}
        className="sm:col-span-2"
        label="Reference photos / files (optional)"
        hint="Photos of windows, vehicles, or design inspiration — up to 5 files, 5 MB each"
      />
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:col-span-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Sending…" : "Submit quote request"}
        </Button>
      </div>
    </form>
  );
}
