import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppointmentStatus, QuoteLineItem } from "@/lib/types/database";

export type QuoteConfirmAppointment = {
  id: string;
  customer_name: string;
  customer_email: string;
  service_title: string;
  appointment_number: string | null;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  quote_amount_cents: number | null;
  quote_line_items: QuoteLineItem[];
  quote_pdf_url: string | null;
  quote_notes: string | null;
  payment_method: "stripe" | "cash" | null;
  payment_status: string;
  quote_confirmed_at: string | null;
};

export type QuoteConfirmLookupResult =
  | { ok: true; appointment: QuoteConfirmAppointment }
  | { ok: false; reason: "invalid" | "not_available" | "already_confirmed" | "cancelled" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAppointmentByCheckoutSession(
  sessionId: string,
): Promise<QuoteConfirmAppointment | null> {
  if (!sessionId?.trim() || !isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, customer_email, service_title, appointment_number, appointment_date, appointment_time, status, quote_amount_cents, quote_line_items, quote_pdf_url, quote_notes, payment_method, payment_status, quote_confirmed_at",
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    service_title: data.service_title,
    appointment_number: data.appointment_number,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    status: data.status,
    quote_amount_cents: data.quote_amount_cents,
    quote_line_items: (data.quote_line_items ?? []) as QuoteLineItem[],
    quote_pdf_url: data.quote_pdf_url,
    quote_notes: data.quote_notes,
    payment_method: data.payment_method as "stripe" | "cash" | null,
    payment_status: data.payment_status,
    quote_confirmed_at: data.quote_confirmed_at,
  };
}

export async function getAppointmentForQuoteConfirm(
  token: string,
): Promise<QuoteConfirmLookupResult> {
  if (!token || !UUID_RE.test(token) || !isSupabaseConfigured()) {
    return { ok: false, reason: "invalid" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, customer_email, service_title, appointment_number, appointment_date, appointment_time, status, quote_amount_cents, quote_line_items, quote_pdf_url, quote_notes, payment_method, payment_status, quote_confirmed_at, quote_confirm_token",
    )
    .eq("quote_confirm_token", token)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "invalid" };
  }

  if (data.status === "cancelled") {
    return { ok: false, reason: "cancelled" };
  }

  if (data.status === "confirmed" || data.status === "in_progress" || data.status === "completed") {
    return {
      ok: true,
      appointment: {
        id: data.id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        service_title: data.service_title,
        appointment_number: data.appointment_number,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        status: data.status,
        quote_amount_cents: data.quote_amount_cents,
        quote_line_items: (data.quote_line_items ?? []) as QuoteLineItem[],
        quote_pdf_url: data.quote_pdf_url,
        quote_notes: data.quote_notes,
        payment_method: data.payment_method as "stripe" | "cash" | null,
        payment_status: data.payment_status,
        quote_confirmed_at: data.quote_confirmed_at,
      },
    };
  }

  if (data.status !== "quote_sent") {
    return { ok: false, reason: "not_available" };
  }

  if (!data.quote_amount_cents || data.quote_amount_cents <= 0) {
    return { ok: false, reason: "not_available" };
  }

  return {
    ok: true,
    appointment: {
      id: data.id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      service_title: data.service_title,
      appointment_number: data.appointment_number,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      status: data.status,
      quote_amount_cents: data.quote_amount_cents,
      quote_line_items: (data.quote_line_items ?? []) as QuoteLineItem[],
      quote_pdf_url: data.quote_pdf_url,
      quote_notes: data.quote_notes,
      payment_method: data.payment_method as "stripe" | "cash" | null,
      payment_status: data.payment_status,
      quote_confirmed_at: data.quote_confirmed_at,
    },
  };
}
