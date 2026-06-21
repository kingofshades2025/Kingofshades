import { TINT_TYPES } from "@/lib/booking/defaults";
import type { PaymentSettings } from "@/lib/types/database";

export type PriceEstimate = {
  baseCents: number;
  tintMultiplier: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositCents: number;
};

const FALLBACK_BASE_CENTS = 34000;

export function getTintMultiplier(tintType?: string): number {
  const match = TINT_TYPES.find((t) => t.id === tintType || t.label === tintType);
  return match?.multiplier ?? 1;
}

export function estimatePrice(opts: {
  basePriceCents?: number | null;
  tintType?: string;
  windowCount?: number;
  paymentSettings: PaymentSettings;
}): PriceEstimate {
  const base = opts.basePriceCents && opts.basePriceCents > 0
    ? opts.basePriceCents
    : FALLBACK_BASE_CENTS;

  const windows = Math.max(1, opts.windowCount ?? 1);
  const tintMultiplier = getTintMultiplier(opts.tintType);
  const windowFactor = opts.windowCount ? Math.min(windows * 0.15 + 0.85, 2.5) : 1;

  const subtotalCents = Math.round(base * tintMultiplier * windowFactor);
  const taxCents = Math.round(subtotalCents * (opts.paymentSettings.taxRatePercent / 100));
  const totalCents = subtotalCents + taxCents;
  const depositCents = Math.round(totalCents * (opts.paymentSettings.depositPercent / 100));

  return {
    baseCents: base,
    tintMultiplier,
    subtotalCents,
    taxCents,
    totalCents,
    depositCents,
  };
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function generateAppointmentNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KS-${date}-${rand}`;
}
