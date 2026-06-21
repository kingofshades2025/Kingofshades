"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { submitBooking } from "@/app/actions/booking";
import { bookingServices, tintPercentages, timeSlots } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

const serviceIcons = { car: Car, home: Home, building: Building2, sticker: Sticker };

const steps = [
  "Service",
  "Details",
  "Date & Time",
  "Your Info",
  "Payment",
];

function Calendar({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (day: number) => void;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:text-gold"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-sm font-semibold text-white">{monthLabel}</p>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:text-gold"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-mist">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1 font-medium">
            {d}
          </span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isPast = day < today;
          const isSelected = selected === day;
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(day)}
              className={cn(
                "aspect-square rounded-lg text-sm transition-colors",
                isPast && "cursor-not-allowed text-mist/30",
                !isPast && !isSelected && "text-snow hover:bg-gold/10 hover:text-gold",
                isSelected && "bg-gold text-ink font-semibold",
                day === today && !isSelected && "ring-1 ring-gold/40",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatBookingDate(day: number | null): string {
  if (day === null) return "";
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );
}

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [tint, setTint] = useState<string>(tintPercentages[2]);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setDetail = (key: string, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const selectedService = bookingServices.find((s) => s.id === service);
  const canNext =
    (step === 0 && !!service) ||
    (step === 2 && day !== null && slot !== null) ||
    (step === 3 && name.trim() && email.trim()) ||
    step === 1 ||
    step === 4;

  const handleConfirmBooking = () => {
    if (!selectedService || day === null || !slot) return;

    setError(null);
    startTransition(async () => {
      const result = await submitBooking({
        service: selectedService.title,
        tint,
        date: formatBookingDate(day),
        time: slot,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        details,
      });

      if (result.success) {
        setSubmitted(true);
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
          <h2 className="mt-6 font-display text-2xl font-bold text-white">
            Booking request sent!
          </h2>
          <p className="mt-3 max-w-md text-sm text-mist">
            We sent a confirmation to <span className="text-snow">{email}</span>.
            Our team will reach out shortly to confirm your appointment.
          </p>
          <p className="mt-2 text-sm text-mist">
            {selectedService?.title} · {formatBookingDate(day)} at {slot}
          </p>
          <Button
            variant="outline"
            className="mt-8"
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setService(null);
              setDay(null);
              setSlot(null);
              setDetails({});
              setName("");
              setPhone("");
              setEmail("");
              setNotes("");
            }}
          >
            Book another appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
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
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  i <= step ? "text-snow" : "text-mist",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px flex-1 sm:mx-3",
                  i < step ? "bg-gold" : "bg-line",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-line bg-surface/70 p-6 sm:p-8">
        {/* STEP 1 — Service selection */}
        {step === 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Select a service
            </h2>
            <p className="mt-1 text-sm text-mist">
              What would you like tinted or wrapped?
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {bookingServices.map((s) => {
                const Icon = serviceIcons[s.icon as keyof typeof serviceIcons];
                const isActive = service === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-5 text-left transition-all",
                      isActive
                        ? "border-gold/60 bg-gold/10 shadow-glow"
                        : "border-line bg-charcoal-light hover:border-gold/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
                        isActive
                          ? "border-gold/40 bg-gold/15 text-gold"
                          : "border-line text-snow/70",
                      )}
                    >
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
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Service details
            </h2>
            <p className="mt-1 text-sm text-mist">
              A few details so we can prepare the right film.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {service === "automotive" ? (
                <>
                  <Field label="Vehicle make">
                    <Input
                      placeholder="e.g. Tesla"
                      value={details["Vehicle make"] ?? ""}
                      onChange={(e) => setDetail("Vehicle make", e.target.value)}
                    />
                  </Field>
                  <Field label="Vehicle model">
                    <Input
                      placeholder="e.g. Model 3"
                      value={details["Vehicle model"] ?? ""}
                      onChange={(e) => setDetail("Vehicle model", e.target.value)}
                    />
                  </Field>
                  <Field label="Year">
                    <Input
                      placeholder="e.g. 2025"
                      value={details.Year ?? ""}
                      onChange={(e) => setDetail("Year", e.target.value)}
                    />
                  </Field>
                  <Field label="Desired tint percentage">
                    <Select value={tint} onChange={(e) => setTint(e.target.value)}>
                      {tintPercentages.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                </>
              ) : service === "decals" ? (
                <>
                  <Field label="Project type">
                    <Select
                      value={details["Project type"] ?? ""}
                      onChange={(e) => setDetail("Project type", e.target.value)}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Custom decal</option>
                      <option>Vehicle graphics / wrap</option>
                      <option>Storefront branding</option>
                      <option>Window graphics</option>
                    </Select>
                  </Field>
                  <Field label="Approx. size / quantity">
                    <Input
                      placeholder="e.g. 2 doors + rear"
                      value={details["Approx. size / quantity"] ?? ""}
                      onChange={(e) =>
                        setDetail("Approx. size / quantity", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Design notes" className="sm:col-span-2">
                    <Textarea
                      placeholder="Describe colors, artwork, or upload reference later…"
                      value={details["Design notes"] ?? ""}
                      onChange={(e) => setDetail("Design notes", e.target.value)}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Property type">
                    <Select
                      value={details["Property type"] ?? ""}
                      onChange={(e) => setDetail("Property type", e.target.value)}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Single-family home</option>
                      <option>Condo / Apartment</option>
                      <option>Office</option>
                      <option>Storefront / Retail</option>
                      <option>Warehouse / Industrial</option>
                    </Select>
                  </Field>
                  <Field label="Number of windows">
                    <Input
                      type="number"
                      placeholder="e.g. 8"
                      min={1}
                      value={details["Number of windows"] ?? ""}
                      onChange={(e) => setDetail("Number of windows", e.target.value)}
                    />
                  </Field>
                  <Field label="Primary goal">
                    <Select
                      value={details["Primary goal"] ?? ""}
                      onChange={(e) => setDetail("Primary goal", e.target.value)}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Heat & energy savings</option>
                      <option>Privacy</option>
                      <option>Glare reduction</option>
                      <option>Security film</option>
                      <option>UV protection</option>
                    </Select>
                  </Field>
                  <Field label="Desired film shade">
                    <Select value={tint} onChange={(e) => setTint(e.target.value)}>
                      {tintPercentages.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Date & time */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Pick a date & time
            </h2>
            <p className="mt-1 text-sm text-mist">
              Choose any available slot — we&apos;ll confirm by text.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Calendar selected={day} onSelect={setDay} />
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-snow/80">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Available times
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSlot(t)}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                        slot === t
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-line bg-charcoal-light text-snow/80 hover:border-gold/30",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {day && slot && (
                  <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                    Selected: {formatBookingDate(day)} at {slot}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Customer info */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Your information
            </h2>
            <p className="mt-1 text-sm text-mist">
              Where should we send your confirmation?
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  placeholder="Jordan Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field label="Phone number">
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Email address" className="sm:col-span-2">
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Notes (optional)" className="sm:col-span-2">
                <Textarea
                  placeholder="Anything else we should know?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 5 — Payment summary */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Payment summary
            </h2>
            <p className="mt-1 text-sm text-mist">
              Review your booking. A deposit secures your slot.
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-charcoal-light p-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="font-semibold text-white">
                    {selectedService?.title ?? "Selected service"}
                  </p>
                  <p className="text-sm text-mist">
                    {formatBookingDate(day)} · {slot}
                  </p>
                  {tint && <p className="text-sm text-mist">Shade: {tint}</p>}
                </div>
                <Badge tone="gold">{selectedService?.from ?? "—"}</Badge>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mist">Service estimate</dt>
                  <dd className="text-snow">$340.00</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                  <dt className="text-white">Estimated total</dt>
                  <dd className="text-white">$498.50</dd>
                </div>
              </dl>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              type="button"
              disabled={isPending}
              onClick={handleConfirmBooking}
            >
              <Lock className="h-4 w-4" />
              {isPending ? "Submitting…" : "Confirm booking request"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-mist">
              <CreditCard className="h-3.5 w-3.5" />
              No payment required yet — we&apos;ll confirm your appointment by email.
            </p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(step === 0 && "invisible")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => canNext && setStep((s) => s + 1)}
              variant={canNext ? "primary" : "subtle"}
            >
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
