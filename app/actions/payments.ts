"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { estimatePrice, formatMoney } from "@/lib/booking/pricing";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getSiteSettings } from "@/lib/queries/public";
import { getSiteBaseUrl } from "@/lib/app-url";
import type { PaymentType } from "@/lib/types/database";

export type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function createAppointmentCheckout(opts: {
  appointmentId: string;
  paymentType: "deposit" | "full";
}): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { success: false, error: "Online payments are not configured yet." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  try {
    const admin = createAdminClient();
    const { data: appointment, error } = await admin
      .from("appointments")
      .select("*")
      .eq("id", opts.appointmentId)
      .maybeSingle();

    if (error || !appointment) {
      return { success: false, error: "Appointment not found." };
    }

    const settings = await getSiteSettings();
    const { payment } = getOperationalSettings(settings);

    const amountCents =
      opts.paymentType === "deposit"
        ? (appointment.deposit_cents ??
          Math.round((appointment.total_cents ?? 0) * (payment.depositPercent / 100)))
        : (appointment.total_cents ?? 0) - (appointment.amount_paid_cents ?? 0);

    if (amountCents <= 0) {
      return { success: false, error: "Nothing to pay for this appointment." };
    }

    const baseUrl = getSiteBaseUrl();
    const stripe = getStripe();

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
              name:
                opts.paymentType === "deposit"
                  ? `Deposit — ${appointment.service_title}`
                  : `Payment — ${appointment.service_title}`,
              description: `${appointment.appointment_number ?? "Appointment"} · ${appointment.appointment_date} ${appointment.appointment_time}`,
            },
          },
        },
      ],
      metadata: {
        appointmentId: appointment.id,
        paymentType: opts.paymentType,
      },
      success_url: `${baseUrl}/booking/confirmation?id=${appointment.id}&paid=1`,
      cancel_url: `${baseUrl}/booking?cancelled=1`,
    });

    await admin.from("payments").insert({
      appointment_id: appointment.id,
      customer_id: appointment.customer_id,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      payment_type: opts.paymentType as PaymentType,
      status: "pending",
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
    console.error("[createAppointmentCheckout]", err);
    return { success: false, error: "Could not start payment. Please try again." };
  }
}

export async function createQuoteCheckout(opts: { quoteId: string }): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { success: false, error: "Online payments are not configured yet." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  try {
    const admin = createAdminClient();
    const { data: quote, error } = await admin
      .from("quote_requests")
      .select("*")
      .eq("id", opts.quoteId)
      .maybeSingle();

    if (error || !quote) {
      return { success: false, error: "Quote not found." };
    }

    const amountCents = quote.quoted_amount_cents ?? 0;
    if (amountCents <= 0) {
      return { success: false, error: "Quote amount is not set." };
    }

    const baseUrl = getSiteBaseUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: quote.customer_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Quote — ${quote.service_type}`,
              description: quote.description.slice(0, 500),
            },
          },
        },
      ],
      metadata: {
        quoteId: quote.id,
        paymentType: "invoice",
      },
      success_url: `${baseUrl}/portal?quotePaid=1`,
      cancel_url: `${baseUrl}/portal?quoteCancelled=1`,
    });

    await admin.from("payments").insert({
      appointment_id: null,
      customer_id: quote.customer_id,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      payment_type: "invoice",
      status: "pending",
      metadata: { quoteId: quote.id },
    });

    if (!session.url) {
      return { success: false, error: "Could not start checkout." };
    }

    return { success: true, url: session.url };
  } catch (err) {
    console.error("[createQuoteCheckout]", err);
    return { success: false, error: "Could not start payment. Please try again." };
  }
}

export async function getBookingPriceEstimate(opts: {
  serviceSlug: string;
  tintType?: string;
  windowCount?: number;
}) {
  const settings = await getSiteSettings();
  const { payment } = getOperationalSettings(settings);

  let basePriceCents: number | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("services")
      .select("price_cents")
      .eq("slug", opts.serviceSlug)
      .maybeSingle();
    basePriceCents = data?.price_cents ?? null;
  }

  const estimate = estimatePrice({
    basePriceCents,
    tintType: opts.tintType,
    windowCount: opts.windowCount,
    paymentSettings: payment,
  });

  return {
    ...estimate,
    formatted: {
      subtotal: formatMoney(estimate.subtotalCents),
      tax: formatMoney(estimate.taxCents),
      total: formatMoney(estimate.totalCents),
      deposit: formatMoney(estimate.depositCents),
    },
    stripeEnabled: isStripeConfigured() && (payment.acceptDeposits || payment.acceptFullPayment),
    payment,
  };
}
