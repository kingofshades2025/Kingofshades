"use client";



import { useRouter } from "next/navigation";

import type { SiteSettings, BlockedDate } from "@/lib/types/database";

import { saveSiteSettings, addBlockedDate, deleteBlockedDate } from "@/app/actions/admin";

import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";

import { AdminPageHeader } from "@/components/admin/AdminUI";

import { getOperationalSettings } from "@/lib/booking/settings";

import { Button } from "@/components/ui/Button";

import { Field, Input, Textarea } from "@/components/ui/Field";

import { useTransition } from "react";



function socialsToLines(socials: { label: string; href: string; icon: string }[]) {

  return socials.map((s) => `${s.label}|${s.href}|${s.icon}`).join("\n");

}



function hoursToLines(hours: { day: string; time: string }[]) {

  return hours.map((h) => `${h.day}|${h.time}`).join("\n");

}



function SettingCheckbox({

  name,

  label,

  defaultChecked,

  description,

}: {

  name: string;

  label: string;

  defaultChecked: boolean;

  description?: string;

}) {

  return (

    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 sm:col-span-1">

      <input

        type="checkbox"

        name={name}

        value="true"

        defaultChecked={defaultChecked}

        className="mt-1 accent-gold"

      />

      <span>

        <span className="block text-sm font-medium text-snow">{label}</span>

        {description && <span className="mt-0.5 block text-xs text-mist">{description}</span>}

      </span>

    </label>

  );

}



export function SettingsManager({

  settings,

  blockedDates = [],

}: {

  settings: SiteSettings | null;

  blockedDates?: BlockedDate[];

}) {

  const router = useRouter();

  const refresh = () => router.refresh();

  const { run, isPending, message, error } = useAdminAction(saveSiteSettings, {

    successMessage: "Settings saved.",

    onSuccess: refresh,

  });

  const blockedAction = useAdminAction(addBlockedDate, {

    successMessage: "Date blocked.",

    onSuccess: refresh,

  });

  const [isDeleting, startDelete] = useTransition();

  const ops = getOperationalSettings(settings);



  return (

    <>

      <AdminPageHeader title="Settings" subtitle="Business info, booking rules, payments, and notifications." />

      <AdminFeedback message={message} error={error} className="mb-4" />



      <form action={run} className="grid gap-4 rounded-2xl border border-line bg-surface/70 p-6 sm:grid-cols-2">

        {settings?.id && <input type="hidden" name="id" value={settings.id} />}

        <h3 className="sm:col-span-2 font-display text-lg font-semibold text-white">Business info</h3>

        <Field label="Business name"><Input name="business_name" defaultValue={settings?.business_name ?? "King of Shades"} /></Field>

        <Field label="Phone"><Input name="phone" defaultValue={settings?.phone ?? ""} /></Field>

        <Field label="Email"><Input name="email" type="email" defaultValue={settings?.email ?? ""} /></Field>

        <Field label="Address line 1"><Input name="address_line1" defaultValue={settings?.address_line1 ?? ""} /></Field>

        <Field label="Address line 2" className="sm:col-span-2"><Input name="address_line2" defaultValue={settings?.address_line2 ?? ""} /></Field>

        <Field label="Business hours (Day|Hours per line)" className="sm:col-span-2">

          <Textarea name="business_hours_lines" rows={4} defaultValue={hoursToLines(settings?.business_hours ?? [])} />

        </Field>

        <Field label="Social links (Label|URL|icon per line)" className="sm:col-span-2">

          <Textarea name="social_links_lines" rows={4} defaultValue={socialsToLines(settings?.social_links ?? [])} />

        </Field>



        <h3 className="sm:col-span-2 mt-4 font-display text-lg font-semibold text-white">Booking settings</h3>

        <Field label="Slot duration (minutes)"><Input name="slot_duration" type="number" defaultValue={ops.booking.slotDurationMinutes} /></Field>

        <Field label="Buffer between slots (minutes)"><Input name="buffer_minutes" type="number" defaultValue={ops.booking.bufferMinutes} /></Field>

        <Field label="Max appointments per day"><Input name="max_daily_appointments" type="number" defaultValue={ops.booking.maxDailyAppointments} /></Field>

        <Field label="Weekday hours (start)"><Input name="weekday_start" defaultValue={ops.booking.weekdayStart} /></Field>

        <Field label="Weekday hours (end)"><Input name="weekday_end" defaultValue={ops.booking.weekdayEnd} /></Field>

        <Field label="Saturday start"><Input name="saturday_start" defaultValue={ops.booking.saturdayStart} /></Field>

        <Field label="Saturday end"><Input name="saturday_end" defaultValue={ops.booking.saturdayEnd} /></Field>

        <SettingCheckbox name="sunday_closed" label="Closed on Sundays" defaultChecked={ops.booking.sundayClosed} />



        <h3 className="sm:col-span-2 mt-4 font-display text-lg font-semibold text-white">Payment settings</h3>

        <Field label="Deposit %"><Input name="deposit_percent" type="number" step="0.1" defaultValue={ops.payment.depositPercent} /></Field>

        <Field label="Tax rate %"><Input name="tax_rate_percent" type="number" step="0.001" defaultValue={ops.payment.taxRatePercent} /></Field>

        <SettingCheckbox name="accept_deposits" label="Accept deposit payments online" defaultChecked={ops.payment.acceptDeposits} />

        <SettingCheckbox name="accept_full_payment" label="Accept full payment online" defaultChecked={ops.payment.acceptFullPayment} />



        <h3 className="sm:col-span-2 mt-4 font-display text-lg font-semibold text-white">Notifications</h3>

        <SettingCheckbox name="email_reminders_enabled" label="Email reminders" defaultChecked={ops.notification.emailRemindersEnabled} />

        <SettingCheckbox name="reminder_24h_enabled" label="24-hour reminder" defaultChecked={ops.notification.reminder24hEnabled} />

        <SettingCheckbox name="reminder_2h_enabled" label="2-hour reminder" defaultChecked={ops.notification.reminder2hEnabled} />

        <SettingCheckbox name="sms_enabled" label="SMS enabled (Twilio — coming soon)" defaultChecked={ops.notification.smsEnabled} />



        <div className="sm:col-span-2"><Button type="submit" disabled={isPending}>Save settings</Button></div>

      </form>



      <div className="mt-8 rounded-2xl border border-line bg-surface/70 p-6">

        <h3 className="font-display text-lg font-semibold text-white">Blocked dates</h3>

        <p className="mt-1 text-sm text-mist">Blackout days when booking is unavailable.</p>

        <AdminFeedback message={blockedAction.message} error={blockedAction.error} className="mt-4" />

        <form action={blockedAction.run} className="mt-4 flex flex-wrap items-end gap-3">

          <Field label="Date"><Input name="blocked_date" type="date" required /></Field>

          <Field label="Reason"><Input name="reason" placeholder="Holiday, shop closed…" /></Field>

          <Button type="submit" disabled={blockedAction.isPending}>Add blackout</Button>

        </form>

        <ul className="mt-4 space-y-2 text-sm">

          {blockedDates.map((d) => (

            <li key={d.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-2">

              <span className="text-snow">{d.blocked_date}{d.reason ? ` — ${d.reason}` : ""}</span>

              <Button

                size="sm"

                variant="subtle"

                disabled={isDeleting}

                onClick={() =>

                  startDelete(async () => {

                    const result = await deleteBlockedDate(d.id);

                    if (result.success) refresh();

                  })

                }

              >

                Remove

              </Button>

            </li>

          ))}

        </ul>

      </div>

    </>

  );

}

