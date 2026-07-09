"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { getSiteBaseUrl } from "@/lib/app-url";
import { getSiteSettings } from "@/lib/queries/public";
import { getBusinessAddressLines } from "@/lib/site-config";
import { sendEmail, appointmentConfirmedHtml } from "@/lib/email";
import { ensureAppointmentCustomer } from "@/lib/customers/upsert";
import { getAppointmentForQuoteConfirm } from "@/lib/queries/quote-confirm";
import type { PaymentType } from "@/lib/types/database";

export type QuoteConfirmResult = { success: true } | { success: false; error: string };

export type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string };

const CONFIRMED_SLOT_STATUSES = ["confirmed", "in_progress"] as const;

async function checkSlotAvailable(
  admin: ReturnType<typeof createAdminClient>,
  dateIso: string,
  time: string,
  excludeAppointmentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await admin
    .from("appointments")
    .select("id")
    .eq("appointment_date", dateIso)
    .eq("appointment_time", time)
    .in("status", [...CONFIRMED_SLOT_STATUSES])
    .neq("id", excludeAppointmentId);

  if (error) return { ok: false, error: error.message };
  if (data && data.length > 0) {
    return {
      ok: false,
      error: "That time slot was just booked. Please contact us to reschedule.",
    };
  }
  return { ok: true };
}

async function sendQuoteConfirmedEmail(appointment: {
  customer_name: string;
  customer_email: string;
  service_title: string;
  appointment_date: string;
  appointment_time: string;
  appointment_number: string | null;
}) {
  try {
    const siteSettings = await getSiteSettings();
    const businessAddress = getBusinessAddressLines(siteSettings);
    await sendEmail({
      to: appointment.customer_email,
      subject: `Appointment confirmed — ${appointment.appointment_number ?? "King of Shades"}`,
      html: appointmentConfirmedHtml({
        name: appointment.customer_name,
        service: appointment.service_title,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        appointmentNumber: appointment.appointment_number ?? undefined,
        addressLine1: businessAddress.line1,
        addressLine2: businessAddress.line2,
      }),
    });
  } catch (err) {
    console.error("[quote-confirm] confirmation email", err);
  }
}

export async function confirmQuoteCash(token: string): Promise<QuoteConfirmResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Service is temporarily unavailable." };
  }

  const lookup = await getAppointmentForQuoteConfirm(token);
  if (!lookup.ok) {
    return { success: false, error: "This quote link is invalid or has expired." };
  }

  const { appointment } = lookup;
  if (appointment.status !== "quote_sent") {
    return { success: false, error: "This quote has already been confirmed." };
  }

  const admin = createAdminClient();
  const slotCheck = await checkSlotAvailable(
    admin,
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.id,
  );
  if (!slotCheck.ok) {
    return { success: false, error: slotCheck.error };
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("appointments")
    .update({
      status: "confirmed",
      payment_method: "cash",
      quote_confirmed_at: now,
      quote_confirm_token: null,
    })
    .eq("id", appointment.id)
    .eq("status", "quote_sent")
    .eq("quote_confirm_token", token);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "That time slot was just booked. Please contact us to reschedule.",
      };
    }
    console.error("[confirmQuoteCash]", error.message);
    return { success: false, error: "Could not confirm your appointment. Please try again." };
  }

  await sendQuoteConfirmedEmail(appointment);

  try {
    await ensureAppointmentCustomer(admin, appointment);
  } catch (customerErr) {
    console.error("[confirmQuoteCash] customer", customerErr);
  }

  return { success: true };
}

export async function createQuoteConfirmCheckout(token: string): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { success: false, error: "Online payments are not available. Choose pay at shop instead." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Service is temporarily unavailable." };
  }

  const lookup = await getAppointmentForQuoteConfirm(token);
  if (!lookup.ok || lookup.appointment.status !== "quote_sent") {
    return { success: false, error: "This quote link is invalid or has already been confirmed." };
  }

  const { appointment } = lookup;
  const amountCents = appointment.quote_amount_cents ?? 0;
  if (amountCents <= 0) {
    return { success: false, error: "Quote amount is not set." };
  }

  const admin = createAdminClient();
  const slotCheck = await checkSlotAvailable(
    admin,
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.id,
  );
  if (!slotCheck.ok) {
    return { success: false, error: slotCheck.error };
  }

  try {
    const baseUrl = getSiteBaseUrl();
    const stripe = getStripe();

    const lineItemSummary = appointment.quote_line_items
      .map((item) => item.label)
      .slice(0, 3)
      .join(", ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: appointment.customer_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Quote — ${appointment.service_title}`,
              description: `${appointment.appointment_number ?? "Appointment"} · ${appointment.appointment_date} ${appointment.appointment_time}${lineItemSummary ? ` · ${lineItemSummary}` : ""}`,
            },
          },
        },
      ],
      metadata: {
        appointmentId: appointment.id,
        quoteConfirmToken: token,
        paymentType: "full",
        quoteConfirm: "true",
      },
      success_url: `${baseUrl}/quote/accept/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/quote/accept?token=${token}&cancelled=1`,
    });

    await admin.from("payments").insert({
      appointment_id: appointment.id,
      customer_id: null,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      payment_type: "full" as PaymentType,
      status: "pending",
      metadata: { quoteConfirm: true, quoteConfirmToken: token },
    });

    await admin
      .from("appointments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", appointment.id);

    if (!session.url) {
      return { success: false, error: "Could not start checkout." };
    }

    return { success: true, url: session.url };
  } catch (err) {
    console.error("[createQuoteConfirmCheckout]", err);
    return { success: false, error: "Could not start payment. Please try again." };
  }
}
