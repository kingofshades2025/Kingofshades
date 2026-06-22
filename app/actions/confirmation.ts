"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildPriceBreakdown, formatMoney } from "@/lib/booking/pricing";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getSiteSettings } from "@/lib/queries/public";

export async function getAppointmentConfirmation(id: string) {
  if (!id || !isSupabaseConfigured()) return null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("appointments")
      .select(
        "appointment_number, service_title, appointment_date, appointment_time, payment_status, total_cents, amount_paid_cents, customer_name, details, services(price_cents)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    const settings = await getSiteSettings();
    const { payment } = getOperationalSettings(settings);
    const details = (data.details ?? {}) as Record<string, string>;
    const serviceJoin = data.services as { price_cents: number | null } | { price_cents: number | null }[] | null;
    const basePriceCents = Array.isArray(serviceJoin)
      ? (serviceJoin[0]?.price_cents ?? null)
      : (serviceJoin?.price_cents ?? null);
    const breakdown = buildPriceBreakdown({
      basePriceCents,
      tintType: details["Tint type"],
      windowCount: Number(details["Number of windows"] || 0) || undefined,
      paymentSettings: payment,
      serviceTitle: data.service_title,
    });

    return {
      ...data,
      breakdown: breakdown.lines,
      formattedTotal: data.total_cents ? formatMoney(data.total_cents) : null,
      formattedPaid: formatMoney(data.amount_paid_cents ?? 0),
    };
  } catch {
    return null;
  }
}
