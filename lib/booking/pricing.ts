import { TINT_TYPES } from "@/lib/booking/defaults";
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

export type PriceBreakdownLine = {
  id: string;
  label: string;
  amountCents: number;
  emphasis?: "muted" | "default" | "strong" | "accent";
  dividerBefore?: boolean;
};

export type PriceBreakdown = {
  estimate: PriceEstimate;
  lines: PriceBreakdownLine[];
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

export function getTintTypeLabel(tintType: string | undefined): string {
  const id = tintType?.toLowerCase() ?? "";
  const match = TINT_TYPES.find((t) => id.includes(t.id) || id === t.id);
  if (match) return match.label;
  if (id.includes("premium")) return "Premium Ceramic";
  if (id.includes("ceramic")) return "Ceramic";
  if (id.includes("carbon")) return "Carbon";
  return "Standard";
}

export function buildPriceBreakdown(opts: {
  basePriceCents?: number | null;
  tintType?: string;
  windowCount?: number;
  paymentSettings: PaymentSettings;
  serviceTitle?: string;
  showDeposit?: boolean;
}): PriceBreakdown {
  const estimate = estimatePrice(opts);
  const payment = opts.paymentSettings;
  const { baseCents, tintMultiplier, windowFactor, subtotalCents, taxCents, totalCents, depositCents } =
    estimate;

  const lines: PriceBreakdownLine[] = [];
  const tintAdjCents = tintMultiplier === 1 ? 0 : Math.round(baseCents * (tintMultiplier - 1));
  const windowAdjCents =
    windowFactor === 1 ? 0 : Math.round(baseCents * tintMultiplier * (windowFactor - 1));
  const baseLineCents = subtotalCents - tintAdjCents - windowAdjCents;

  lines.push({
    id: "base",
    label: opts.serviceTitle ? `${opts.serviceTitle} (base price)` : "Base service price",
    amountCents: baseLineCents,
  });

  if (tintAdjCents !== 0) {
    const tintLabel = getTintTypeLabel(opts.tintType);
    const pct = Math.round((tintMultiplier - 1) * 100);
    lines.push({
      id: "tint",
      label: pct > 0 ? `${tintLabel} tint (+${pct}%)` : `${tintLabel} tint`,
      amountCents: tintAdjCents,
    });
  }

  if (windowAdjCents !== 0) {
    const windowLabel = opts.windowCount
      ? `${opts.windowCount} window${opts.windowCount === 1 ? "" : "s"}`
      : "Window sizing adjustment";
    lines.push({
      id: "windows",
      label: windowLabel,
      amountCents: windowAdjCents,
    });
  }

  lines.push({
    id: "subtotal",
    label: "Subtotal",
    amountCents: subtotalCents,
    dividerBefore: lines.length > 1,
  });

  if (payment.taxRatePercent > 0) {
    lines.push({
      id: "tax",
      label: `Tax (${payment.taxRatePercent}%)`,
      amountCents: taxCents,
    });
  }

  lines.push({
    id: "total",
    label: "Total",
    amountCents: totalCents,
    emphasis: "strong",
    dividerBefore: true,
  });

  if (opts.showDeposit !== false && payment.acceptDeposits && payment.depositPercent > 0) {
    lines.push({
      id: "deposit",
      label: `Deposit due now (${payment.depositPercent}%)`,
      amountCents: depositCents,
      emphasis: "accent",
    });

    const balanceCents = totalCents - depositCents;
    if (balanceCents > 0) {
      lines.push({
        id: "balance",
        label: "Balance due at appointment",
        amountCents: balanceCents,
        emphasis: "muted",
      });
    }
  }

  return { estimate, lines };
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatBreakdownAmount(line: PriceBreakdownLine): string {
  const formatted = formatMoney(Math.abs(line.amountCents));
  if ((line.id === "tint" || line.id === "windows") && line.amountCents > 0) {
    return `+${formatted}`;
  }
  if (line.amountCents < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function generateAppointmentNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KS-${date}-${rand}`;
}
