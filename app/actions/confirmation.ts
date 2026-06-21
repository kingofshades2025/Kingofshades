"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatMoney } from "@/lib/booking/pricing";

export async function getAppointmentConfirmation(id: string) {
  if (!id || !isSupabaseConfigured()) return null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("appointments")
      .select(
        "appointment_number, service_title, appointment_date, appointment_time, payment_status, total_cents, amount_paid_cents, customer_name",
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      formattedTotal: data.total_cents ? formatMoney(data.total_cents) : null,
      formattedPaid: formatMoney(data.amount_paid_cents ?? 0),
    };
  } catch {
    return null;
  }
}
