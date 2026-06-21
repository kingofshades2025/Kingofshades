"use client";

import { useTransition } from "react";
import type { SiteSettings, ContentSection } from "@/lib/types/database";
import { saveContentSection, saveSiteSettings } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function SettingsManager({
  settings,
  sections,
}: {
  settings: SiteSettings | null;
  sections: ContentSection[];
}) {
  const [isPending, startTransition] = useTransition();
  const hero = sections.find((s) => s.section_key === "hero_title");
  const heroSub = sections.find((s) => s.section_key === "hero_subtitle");
  const heroBadge = sections.find((s) => s.section_key === "hero_badge");

  return (
    <>
      <AdminPageHeader title="Settings" subtitle="Update business info and homepage content." />

      <form
        action={(fd) => startTransition(() => { void saveSiteSettings(fd); })}
        className="mb-8 grid gap-4 rounded-2xl border border-line bg-surface/70 p-6 sm:grid-cols-2"
      >
        {settings?.id && <input type="hidden" name="id" value={settings.id} />}
        <input type="hidden" name="social_links" value={JSON.stringify(settings?.social_links ?? [])} />
        <input type="hidden" name="business_hours" value={JSON.stringify(settings?.business_hours ?? [])} />
        <h3 className="sm:col-span-2 font-display text-lg font-semibold text-white">Business info</h3>
        <Field label="Business name"><Input name="business_name" defaultValue={settings?.business_name ?? "King of Shades"} /></Field>
        <Field label="Phone"><Input name="phone" defaultValue={settings?.phone ?? ""} /></Field>
        <Field label="Email"><Input name="email" type="email" defaultValue={settings?.email ?? ""} /></Field>
        <Field label="Address line 1"><Input name="address_line1" defaultValue={settings?.address_line1 ?? ""} /></Field>
        <Field label="Address line 2" className="sm:col-span-2"><Input name="address_line2" defaultValue={settings?.address_line2 ?? ""} /></Field>
        <div className="sm:col-span-2"><Button type="submit" disabled={isPending}>Save business info</Button></div>
      </form>

      <div className="space-y-6">
        {[
          { key: "hero_badge", label: "Hero badge", value: heroBadge },
          { key: "hero_title", label: "Hero headline", value: hero },
          { key: "hero_subtitle", label: "Hero subtitle", value: heroSub, body: true },
        ].map(({ key, label, value, body }) => (
          <form
            key={key}
            action={(fd) => startTransition(() => { void saveContentSection(fd); })}
            className="rounded-2xl border border-line bg-surface/70 p-6"
          >
            <input type="hidden" name="section_key" value={key} />
            <input type="hidden" name="metadata" value="{}" />
            <h3 className="font-display text-base font-semibold text-white">{label}</h3>
            <div className="mt-4">
              {body ? (
                <Field label="Text"><Textarea name="body" defaultValue={value?.body ?? ""} /></Field>
              ) : (
                <Field label="Text"><Input name="title" defaultValue={value?.title ?? ""} /></Field>
              )}
            </div>
            <Button type="submit" size="sm" className="mt-4" disabled={isPending}>Save</Button>
          </form>
        ))}
      </div>
    </>
  );
}
