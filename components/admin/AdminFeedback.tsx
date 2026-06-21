"use client";

import { useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

export function AdminFeedback({
  message,
  error,
  className,
}: {
  message?: string | null;
  error?: string | null;
  className?: string;
}) {
  if (!message && !error) return null;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        error
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
        className,
      )}
      role="status"
    >
      {error ?? message}
    </div>
  );
}

export function useAdminAction<T extends AdminActionResult>(
  action: (input: FormData) => Promise<T>,
  options?: {
    successMessage?: string;
    onSuccess?: () => void;
  },
) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    (formData: FormData) => {
      setMessage(null);
      setError(null);
      startTransition(() => {
        void (async () => {
          try {
            const result = await action(formData);
            if (result.success) {
              setMessage(options?.successMessage ?? "Saved successfully.");
              options?.onSuccess?.();
            } else {
              setError(result.error);
            }
          } catch (err) {
            console.error("[admin action]", err);
            setError("Something went wrong. Please try again.");
          }
        })();
      });
    },
    [action, options],
  );

  const clearFeedback = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  return { run, isPending, message, error, clearFeedback };
}

export function useAdminMutation<T extends AdminActionResult>(
  action: () => Promise<T>,
  options?: { successMessage?: string; onSuccess?: () => void },
) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setMessage(null);
    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          const result = await action();
          if (result.success) {
            setMessage(options?.successMessage ?? "Done.");
            options?.onSuccess?.();
          } else {
            setError(result.error);
          }
        } catch (err) {
          console.error("[admin mutation]", err);
          setError("Something went wrong. Please try again.");
        }
      })();
    });
  }, [action, options]);

  return { run, isPending, message, error };
}
