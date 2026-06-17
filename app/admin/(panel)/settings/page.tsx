import { Building2, Clock, DollarSign, Share2, Bell, Save } from "lucide-react";
import { site } from "@/lib/site";
import { services } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Field";
import { AdminPageHeader } from "@/components/admin/AdminUI";

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-line py-8 first:pt-0 lg:grid-cols-[260px_1fr]">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-mist">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Switch({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-charcoal-light px-4 py-3">
      <span className="text-sm text-snow/85">{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-gold" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        subtitle="Manage your business profile, pricing, and preferences."
        actions={
          <Button size="sm">
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        }
      />

      <div className="rounded-2xl border border-line bg-surface/70 p-6 sm:p-8">
        <SettingsSection
          icon={Building2}
          title="Business Information"
          description="Your public contact details and address."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name">
              <Input defaultValue={site.name} />
            </Field>
            <Field label="Phone number">
              <Input defaultValue={site.phone} />
            </Field>
            <Field label="Email address">
              <Input defaultValue={site.email} />
            </Field>
            <Field label="Website">
              <Input defaultValue="www.kingofshades.com" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input defaultValue={`${site.address.line1}, ${site.address.line2}`} />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Clock}
          title="Business Hours"
          description="When customers can book appointments."
        >
          <div className="space-y-3">
            {site.hours.map((h) => (
              <div
                key={h.day}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-charcoal-light px-4 py-3"
              >
                <span className="text-sm font-medium text-snow/85">{h.day}</span>
                <span className="text-sm text-mist">{h.time}</span>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={DollarSign}
          title="Service Pricing"
          description="Starting prices shown to customers."
        >
          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s.slug}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-charcoal-light px-4 py-3"
              >
                <span className="text-sm font-medium text-snow/85">{s.title}</span>
                <div className="flex items-center gap-2">
                  <Label className="mb-0 text-xs text-mist">From</Label>
                  <Input
                    defaultValue={s.startingAt}
                    className="h-9 w-32 py-1.5 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Share2}
          title="Social Media Links"
          description="Links shown in your website footer."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {site.socials.map((s) => (
              <Field key={s.label} label={s.label}>
                <Input defaultValue={`https://${s.icon}.com/kingofshades`} />
              </Field>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notification Preferences"
          description="Choose how you and customers get notified."
        >
          <div className="space-y-3">
            <Switch label="Email me about new bookings" defaultOn />
            <Switch label="SMS alerts for same-day appointments" defaultOn />
            <Switch label="Send customers appointment reminders" defaultOn />
            <Switch label="Weekly revenue summary email" />
            <Switch label="Marketing & promotion suggestions" />
          </div>
        </SettingsSection>

        <div className="flex justify-end pt-8">
          <Button>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}
