"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="mt-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-4 text-sm text-mist">
          Check your email for a password reset link.
        </p>
        <Link href="/admin/login" className="mt-6 inline-block text-sm text-gold">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await requestPasswordReset(formData.get("email") as string);
          if (result.success) setSent(true);
          else setError(result.error);
        });
      }}
      className="mt-8 space-y-5"
    >
      <Field label="Email address" htmlFor="email">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </Field>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
