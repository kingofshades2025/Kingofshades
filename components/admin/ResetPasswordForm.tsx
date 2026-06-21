"use client";

import { useState, useTransition } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm") as string;
        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        startTransition(async () => {
          const result = await updatePassword(password);
          if (!result.success) setError(result.error);
        });
      }}
      className="mt-8 space-y-5"
    >
      <Field label="New password" htmlFor="password">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          disabled={isPending}
        />
      </Field>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
