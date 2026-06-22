"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Car,
  Home,
  Building2,
  Sticker,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { submitBooking } from "@/app/actions/booking";
import { getAvailableTimeSlots } from "@/app/actions/availability";
import { getBookingPriceEstimate } from "@/app/actions/payments";
import { bookingServices as defaultBookingServices, tintPercentages } from "@/lib/data";
import { CUSTOM_QUOTE_SERVICE, TINT_TYPES } from "@/lib/booking/defaults";
import { resolveServiceFormKind } from "@/lib/booking/service-form";
import { formatDateLabel } from "@/lib/booking/availability";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { VehicleFields } from "@/components/booking/VehicleFields";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

const serviceIcons = { car: Car, home: Home, building: Building2, sticker: Sticker };

const steps = ["Service", "Details", "Date & Time", "Your Info", "Payment"];

type BookingService = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent?: string;
  from: string;
  priceCents?: number | null;
};

export function BookingWizard({
  services: initialServices = defaultBookingServices,
}: {
  services?: BookingService[];
}) {
  const bookingServices = [...initialServices, CUSTOM_QUOTE_SERVICE];
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [tint, setTint] = useState<string>(tintPercentages[2]);
  const [tintType, setTintType] = useState<string>(TINT_TYPES[1].id);
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<"none" | "deposit" | "full">("none");
  const [pricing, setPricing] = useState<Awaited<ReturnType<typeof getBookingPriceEstimate>> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [appointmentNumber, setAppointmentNumber] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setDetail = (key: string, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const selectedService = bookingServices.find((s) => s.id === service);
  const formKind = selectedService
    ? resolveServiceFormKind({
        id: selectedService.id,
        accent: selectedService.accent,
        icon: selectedService.icon,
      })
    : null;
  const windowCount = Number(details["Number of windows"] || 0) || undefined;

  useEffect(() => {
    if (!dateIso) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSlot(null);
    getAvailableTimeSlots(dateIso)
      .then((result) => {
        setAvailableSlots(result.slots);
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [dateIso]);

  useEffect(() => {
    if (!service || service === "custom-quote" || step !== 4) return;
    getBookingPriceEstimate({
      serviceSlug: service,
      tintType,
      windowCount,
    }).then(setPricing);
  }, [service, tintType, windowCount, step]);

  const canNext =
    (step === 0 && !!service) ||
    (step === 2 && dateIso !== null && slot !== null) ||
    (step === 3 && name.trim() && email.trim()) ||
    step === 1 ||
    step === 4;

  const handleContinue = () => {
    if (step === 0 && service === "custom-quote") return;
    if (canNext) setStep((s) => s + 1);
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !dateIso || !slot) return;

    setError(null);
    startTransition(async () => {
      const result = await submitBooking({
        service: selectedService.title,
        serviceSlug: selectedService.id,
        tint,
        tintType,
        date: formatDateLabel(dateIso),
        dateIso,
        time: slot,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        details,
        paymentMode: pricing?.stripeEnabled ? paymentMode : "none",
        windowCount,
      });

      if (result.success) {
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        setAppointmentNumber(result.appointmentNumber ?? null);
        setSubmitted(true);
        setSubmitWarning(result.warning ?? null);
      } else {
        setError(result.error);
      }
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center rounded-3xl border border-gold/30 bg-gold/5 px-6 py-16 text-center sm:px-12">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="mt-6 font-display text-2xl font-bold text-white">Booking confirmed!</h2>
          {appointmentNumber && (
            <p className="mt-2 font-mono text-sm text-gold">#{appointmentNumber}</p>
          )}
          <p className="mt-3 max-w-md text-sm text-mist">
            Confirmation sent to <span className="text-snow">{email}</span>.
          </p>
          {submitWarning && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {submitWarning}
            </div>
          )}
          <p className="mt-2 text-sm text-mist">
            {selectedService?.title} · {formatDateLabel(dateIso!)} at {slot}
          </p>
          <Button
            variant="outline"
            className="mt-8"
            onClick={() => window.location.reload()}
          >
            Book another appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-10 flex items-center">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold transition-colors",
                  i < step && "border-gold bg-gold text-ink",
                  i === step && "border-gold bg-gold/15 text-gold",
                  i > step && "border-line bg-charcoal-light text-mist",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", i <= step ? "text-snow" : "text-mist")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn("mx-2 h-px flex-1 sm:mx-3", i < step ? "bg-gold" : "bg-line")} />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-line bg-surface/70 p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Select a service</h2>
            <p className="mt-1 text-sm text-mist">What would you like tinted or wrapped?</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {bookingServices.map((s) => {
                const Icon = serviceIcons[s.icon as keyof typeof serviceIcons] ?? Sticker;
                const isActive = service === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-5 text-left transition-all",
                      isActive ? "border-gold/60 bg-gold/10 shadow-glow" : "border-line bg-charcoal-light hover:border-gold/30",
                    )}
                  >
                    <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl border", isActive ? "border-gold/40 bg-gold/15 text-gold" : "border-line text-snow/70")}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{s.title}</p>
                      <p className="text-sm text-mist">{s.description}</p>
                      <p className="mt-1 text-xs font-medium text-gold">From {s.from}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {service === "custom-quote" && (
              <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <p className="text-sm text-mist">
                  Custom projects need a quote first. Continue to our quote request form.
                </p>
                <Button href="/quote" className="mt-4">
                  <FileText className="h-4 w-4" />
                  Request a custom quote
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Service details</h2>
            <p className="mt-1 text-sm text-mist">Help us prepare the right film and estimate.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {formKind === "automotive" ? (
                <>
                  <VehicleFields
                    year={details.Year ?? ""}
                    make={details["Vehicle make"] ?? ""}
                    model={details["Vehicle model"] ?? ""}
                    onYearChange={(v) => setDetail("Year", v)}
                    onMakeChange={(v) => setDetail("Vehicle make", v)}
                    onModelChange={(v) => setDetail("Vehicle model", v)}
                  />
                  <Field label="Number of windows"><Input type="number" min={1} placeholder="e.g. 5" value={details["Number of windows"] ?? ""} onChange={(e) => setDetail("Number of windows", e.target.value)} /></Field>
                  <Field label="Tint percentage"><Select value={tint} onChange={(e) => setTint(e.target.value)}>{tintPercentages.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                  <Field label="Tint type"><Select value={tintType} onChange={(e) => setTintType(e.target.value)}>{TINT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</Select></Field>
                </>
              ) : formKind === "decals" ? (
                <>
                  <Field label="Project type"><Select value={details["Project type"] ?? ""} onChange={(e) => setDetail("Project type", e.target.value)}><option value="" disabled>Select…</option><option>Custom decal</option><option>Vehicle graphics / wrap</option><option>Storefront branding</option><option>Window graphics</option></Select></Field>
                  <Field label="Approx. size / quantity"><Input placeholder="e.g. 2 doors + rear" value={details["Approx. size / quantity"] ?? ""} onChange={(e) => setDetail("Approx. size / quantity", e.target.value)} /></Field>
                  <Field label="Design notes" className="sm:col-span-2"><Textarea placeholder="Describe colors, artwork, or reference images…" value={details["Design notes"] ?? ""} onChange={(e) => setDetail("Design notes", e.target.value)} /></Field>
                </>
              ) : (
                <>
                  <Field label="Property type"><Select value={details["Property type"] ?? ""} onChange={(e) => setDetail("Property type", e.target.value)}><option value="" disabled>Select…</option><option>Single-family home</option><option>Condo / Apartment</option><option>Office</option><option>Storefront / Retail</option><option>Warehouse / Industrial</option></Select></Field>
                  <Field label="Number of windows"><Input type="number" min={1} placeholder="e.g. 8" value={details["Number of windows"] ?? ""} onChange={(e) => setDetail("Number of windows", e.target.value)} /></Field>
                  <Field label="Window dimensions"><Input placeholder="e.g. 36x48 in each" value={details["Window dimensions"] ?? ""} onChange={(e) => setDetail("Window dimensions", e.target.value)} /></Field>
                  <Field label="Desired film shade"><Select value={tint} onChange={(e) => setTint(e.target.value)}>{tintPercentages.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                  <Field label="Additional notes" className="sm:col-span-2"><Textarea placeholder="Access notes, floor level, etc." value={details["Additional notes"] ?? ""} onChange={(e) => setDetail("Additional notes", e.target.value)} /></Field>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Pick a date & time</h2>
            <p className="mt-1 text-sm text-mist">Real-time availability — no double booking.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <BookingCalendar selectedIso={dateIso} onSelect={setDateIso} />
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-snow/80">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Available times
                </p>
                {!dateIso ? (
                  <p className="text-sm text-mist">Select a date to see open slots.</p>
                ) : loadingSlots ? (
                  <p className="text-sm text-mist">Loading availability…</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-mist">No slots available this day. Try another date.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((t) => (
                      <button key={t} type="button" onClick={() => setSlot(t)} className={cn("rounded-xl border py-2.5 text-sm font-medium transition-colors", slot === t ? "border-gold bg-gold/15 text-gold" : "border-line bg-charcoal-light text-snow/80 hover:border-gold/30")}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {dateIso && slot && (
                  <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                    Selected: {formatDateLabel(dateIso)} at {slot}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Your information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name"><Input placeholder="Jordan Carter" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
              <Field label="Phone number"><Input type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Email address" className="sm:col-span-2"><Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
              {(formKind === "residential" || formKind === "commercial") && (
                <Field label="Property address" className="sm:col-span-2"><Input placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
              )}
              <Field label="Notes (optional)" className="sm:col-span-2"><Textarea placeholder="Anything else we should know?" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Payment summary</h2>
            <div className="mt-6 rounded-2xl border border-line bg-charcoal-light p-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="font-semibold text-white">{selectedService?.title}</p>
                  <p className="text-sm text-mist">{dateIso && formatDateLabel(dateIso)} · {slot}</p>
                </div>
                <Badge tone="gold">{pricing?.formatted.total ?? selectedService?.from ?? "—"}</Badge>
              </div>
              {pricing && (
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-mist">Subtotal</dt><dd className="text-snow">{pricing.formatted.subtotal}</dd></div>
                  <div className="flex justify-between"><dt className="text-mist">Tax</dt><dd className="text-snow">{pricing.formatted.tax}</dd></div>
                  <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt className="text-white">Total</dt><dd className="text-white">{pricing.formatted.total}</dd></div>
                  <div className="flex justify-between text-gold"><dt>Deposit ({pricing.payment.depositPercent}%)</dt><dd>{pricing.formatted.deposit}</dd></div>
                </dl>
              )}
            </div>

            {pricing?.stripeEnabled && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-snow">Payment option</p>
                {(
                  [
                    { mode: "none" as const, label: "Pay later — confirm booking only", show: true },
                    {
                      mode: "deposit" as const,
                      label: `Pay deposit now (${pricing.formatted.deposit})`,
                      show: pricing.payment.acceptDeposits,
                    },
                    {
                      mode: "full" as const,
                      label: `Pay in full now (${pricing.formatted.total})`,
                      show: pricing.payment.acceptFullPayment,
                    },
                  ].filter((o) => o.show)
                ).map(({ mode, label }) => (
                  <label key={mode} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3", paymentMode === mode ? "border-gold/50 bg-gold/10" : "border-line")}>
                    <input type="radio" name="paymentMode" checked={paymentMode === mode} onChange={() => setPaymentMode(mode)} className="accent-gold" />
                    <span className="text-sm text-snow">{label}</span>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button size="lg" className="mt-6 w-full" type="button" disabled={isPending} onClick={handleConfirmBooking}>
              <Lock className="h-4 w-4" />
              {isPending ? "Submitting…" : paymentMode !== "none" && pricing?.stripeEnabled ? "Confirm & pay" : "Confirm booking"}
            </Button>
            {!pricing?.stripeEnabled && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-mist">
                <CreditCard className="h-3.5 w-3.5" />
                Online payment coming soon — no charge today.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn(step === 0 && "invisible")}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleContinue} variant={canNext && service !== "custom-quote" ? "primary" : "subtle"} disabled={!canNext || service === "custom-quote"}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <span className="text-sm text-mist">Step {step + 1} of {steps.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}
