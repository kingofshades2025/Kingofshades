"use client";

import { useState } from "react";
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
} from "lucide-react";
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

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [tint, setTint] = useState<string>(tintPercentages[2]);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const selectedService = bookingServices.find((s) => s.id === service);
  const canNext =
    (step === 0 && !!service) ||
    (step === 2 && day !== null && slot !== null) ||
    step === 1 ||
    step === 3 ||
    step === 4;

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
                    <Input placeholder="e.g. Tesla" />
                  </Field>
                  <Field label="Vehicle model">
                    <Input placeholder="e.g. Model 3" />
                  </Field>
                  <Field label="Year">
                    <Input placeholder="e.g. 2025" />
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
                    <Select defaultValue="">
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
                    <Input placeholder="e.g. 2 doors + rear" />
                  </Field>
                  <Field label="Design notes" className="sm:col-span-2">
                    <Textarea placeholder="Describe colors, artwork, or upload reference later…" />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Property type">
                    <Select defaultValue="">
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
                    <Input type="number" placeholder="e.g. 8" min={1} />
                  </Field>
                  <Field label="Primary goal">
                    <Select defaultValue="">
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
              Choose any available slot — we'll confirm by text.
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
                    Selected: Day {day} at {slot}
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
                <Input placeholder="Jordan Carter" />
              </Field>
              <Field label="Phone number">
                <Input type="tel" placeholder="(555) 123-4567" />
              </Field>
              <Field label="Email address" className="sm:col-span-2">
                <Input type="email" placeholder="you@email.com" />
              </Field>
              <Field label="Notes (optional)" className="sm:col-span-2">
                <Textarea placeholder="Anything else we should know?" />
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
                    {selectedService?.title ?? "Selected service"} Tint
                  </p>
                  <p className="text-sm text-mist">Shade: {tint}</p>
                </div>
                <Badge tone="gold">{selectedService?.from ?? "—"}</Badge>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mist">Service estimate</dt>
                  <dd className="text-snow">$340.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Premium ceramic upgrade</dt>
                  <dd className="text-snow">$120.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Taxes & fees</dt>
                  <dd className="text-snow">$38.50</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                  <dt className="text-white">Estimated total</dt>
                  <dd className="text-white">$498.50</dd>
                </div>
                <div className="flex justify-between rounded-xl bg-gold/10 px-4 py-3 font-semibold text-gold">
                  <dt>Due today (deposit)</dt>
                  <dd>$99.00</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Card number" className="sm:col-span-2">
                <Input placeholder="4242 4242 4242 4242" inputMode="numeric" />
              </Field>
              <Field label="Expiry">
                <Input placeholder="MM / YY" />
              </Field>
              <Field label="CVC">
                <Input placeholder="123" inputMode="numeric" />
              </Field>
            </div>

            <Button size="lg" className="mt-6 w-full" type="button">
              <Lock className="h-4 w-4" />
              Pay $99.00 Deposit
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-mist">
              <CreditCard className="h-3.5 w-3.5" />
              Demo only — no payment will be processed in this prototype.
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
