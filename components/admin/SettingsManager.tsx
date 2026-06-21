"use client";

import { useTransition } from "react";
import type { SiteSettings } from "@/lib/types/database";
import { saveSiteSettings } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

function socialsToLines(
  socials: { label: string; href: string; icon: string }[],
) {
  return socials.map((s) => `${s.label}|${s.href}|${s.icon}`).join("\n");
}

function hoursToLines(hours: { day: string; time: string }[]) {
  return hours.map((h) => `${h.day}|${h.time}`).join("\n");
}

export function SettingsManager({ settings }: { settings: SiteSettings | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        subtitle="Business contact info, hours, and social links. Edit page copy under Content."
      />

      <form
        action={(fd) => startTransition(() => { void saveSiteSettings(fd); })}
        className="grid gap-4 rounded-2xl border border-line bg-surface/70 p-6 sm:grid-cols-2"
      >
        {settings?.id && <input type="hidden" name="id" value={settings.id} />}
        <h3 className="sm:col-span-2 font-display text-lg font-semibold text-white">Business info</h3>
        <Field label="Business name"><Input name="business_name" defaultValue={settings?.business_name ?? "King of Shades"} /></Field>
        <Field label="Phone"><Input name="phone" defaultValue={settings?.phone ?? ""} /></Field>
        <Field label="Email"><Input name="email" type="email" defaultValue={settings?.email ?? ""} /></Field>
        <Field label="Address line 1"><Input name="address_line1" defaultValue={settings?.address_line1 ?? ""} /></Field>
        <Field label="Address line 2" className="sm:col-span-2"><Input name="address_line2" defaultValue={settings?.address_line2 ?? ""} /></Field>

        <Field label="Business hours (Day|Hours per line)" className="sm:col-span-2">
          <Textarea
            name="business_hours_lines"
            rows={4}
            defaultValue={hoursToLines(settings?.business_hours ?? [])}
          />
        </Field>

        <Field label="Social links (Label|URL|icon per line — instagram, facebook, tiktok, youtube)" className="sm:col-span-2">
          <Textarea
            name="social_links_lines"
            rows={4}
            defaultValue={socialsToLines(settings?.social_links ?? [])}
          />
        </Field>

        <div className="sm:col-span-2"><Button type="submit" disabled={isPending}>Save settings</Button></div>
      </form>
    </>
  );
}
