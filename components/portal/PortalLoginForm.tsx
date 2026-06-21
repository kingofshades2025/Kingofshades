"use client";

import { useTransition, useState } from "react";
import { sendPortalMagicLink } from "@/app/actions/portal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function PortalLoginForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return sent ? (
    <p className="mt-6 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold">
      Check your email for a secure sign-in link.
    </p>
  ) : (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await sendPortalMagicLink(fd);
          if (result.success) setSent(true);
          else setError(result.error);
        });
      }}
    >
      <Field label="Email address">
        <Input name="email" type="email" required placeholder="you@email.com" />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
