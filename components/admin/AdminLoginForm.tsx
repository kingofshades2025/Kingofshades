"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { signInWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Field";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "You are not authorized to access the admin panel."
      : searchParams.get("error") === "auth_callback"
        ? "Authentication failed. Please try again."
        : null,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signInWithPassword(
            formData.get("email") as string,
            formData.get("password") as string,
          );
          if (!result.success) setError(result.error);
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
            placeholder="admin@kingofshadesnj.com"
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-gold hover:text-gold-light"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="pl-10"
            disabled={isPending}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in to Dashboard"}
      </Button>
    </form>
  );
}
