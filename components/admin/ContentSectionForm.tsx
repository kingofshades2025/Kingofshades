"use client";

import { useTransition, type ReactNode } from "react";
import { saveContentSection } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";

export function ContentSectionForm({
  sectionKey,
  title,
  children,
  buildMetadata,
  defaultTitle = "",
  defaultBody = "",
}: {
  sectionKey: string;
  title: string;
  children: ReactNode;
  buildMetadata?: (formData: FormData) => Record<string, unknown>;
  defaultTitle?: string;
  defaultBody?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        formData.set("section_key", sectionKey);
        if (!formData.has("title")) formData.set("title", defaultTitle);
        if (!formData.has("body")) formData.set("body", defaultBody);
        formData.set(
          "metadata",
          JSON.stringify(buildMetadata?.(formData) ?? {}),
        );
        startTransition(() => {
          void saveContentSection(formData);
        });
      }}
      className="rounded-2xl border border-line bg-surface/70 p-6"
    >
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
      <Button type="submit" size="sm" className="mt-4" disabled={isPending}>
        Save
      </Button>
    </form>
  );
}
