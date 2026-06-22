import type { PaymentSettings } from "@/lib/types/database";

export type PriceEstimate = {
  baseCents: number;
  tintMultiplier: number;
  windowFactor: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositCents: number;
};

export function getTintMultiplier(tintType: string | undefined, payment: PaymentSettings): number {
  const id = tintType?.toLowerCase() ?? "";
  if (id.includes("premium")) return payment.tintPremiumMultiplier;
  if (id.includes("ceramic")) return payment.tintCeramicMultiplier;
  if (id.includes("carbon")) return payment.tintCarbonMultiplier;
  return payment.tintCarbonMultiplier;
}

export function getWindowFactor(windowCount: number | undefined, payment: PaymentSettings): number {
  if (!windowCount || windowCount < 1) return 1;
  const windows = Math.max(1, windowCount);
  return Math.min(
    windows * payment.windowFactorPerWindow + payment.windowFactorBase,
    payment.windowFactorMax,
  );
}

export function estimatePrice(opts: {
  basePriceCents?: number | null;
  tintType?: string;
  windowCount?: number;
  paymentSettings: PaymentSettings;
}): PriceEstimate {
  const payment = opts.paymentSettings;
  const base =
    opts.basePriceCents && opts.basePriceCents > 0
      ? opts.basePriceCents
      : payment.fallbackBaseCents;

  const tintMultiplier = getTintMultiplier(opts.tintType, payment);
  const windowFactor = getWindowFactor(opts.windowCount, payment);

  const subtotalCents = Math.round(base * tintMultiplier * windowFactor);
  const taxCents = Math.round(subtotalCents * (payment.taxRatePercent / 100));
  const totalCents = subtotalCents + taxCents;
  const depositCents = Math.round(totalCents * (payment.depositPercent / 100));

  return {
    baseCents: base,
    tintMultiplier,
    windowFactor,
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
