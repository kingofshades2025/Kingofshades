import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/queries/public";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getBusinessAddressLines } from "@/lib/site-config";
import { sendEmail, appointmentConfirmedHtml } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;
    const quoteId = session.metadata?.quoteId;
    const paymentType = session.metadata?.paymentType ?? "deposit";
    const isQuoteConfirm = session.metadata?.quoteConfirm === "true";
    const quoteConfirmToken = session.metadata?.quoteConfirmToken;

    if (quoteId) {
      try {
        const admin = createAdminClient();

        const { data: existingPayment } = await admin
          .from("payments")
          .select("status")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        if (existingPayment?.status === "succeeded") {
          return NextResponse.json({ received: true, duplicate: true });
        }

        await admin
          .from("payments")
          .update({
            status: "succeeded",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          })
          .eq("stripe_checkout_session_id", session.id);

        await admin
          .from("quote_requests")
          .update({ status: "approved" })
          .eq("id", quoteId);
      } catch (err) {
        console.error("[stripe webhook quote]", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    } else if (appointmentId) {
      try {
        const admin = createAdminClient();

        const { data: existingPayment } = await admin
          .from("payments")
          .select("status")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        if (existingPayment?.status === "succeeded") {
          return NextResponse.json({ received: true, duplicate: true });
        }

        const amountPaid = session.amount_total ?? 0;

        await admin
          .from("payments")
          .update({
            status: "succeeded",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          })
          .eq("stripe_checkout_session_id", session.id);

        const { data: appointment } = await admin
          .from("appointments")
          .select(
            "amount_paid_cents, total_cents, deposit_cents, customer_name, customer_email, service_title, appointment_date, appointment_time, appointment_number, status",
          )
          .eq("id", appointmentId)
          .maybeSingle();

        const newPaid = (appointment?.amount_paid_cents ?? 0) + amountPaid;
        const total = appointment?.total_cents ?? 0;
        const deposit = appointment?.deposit_cents ?? 0;

        let paymentStatus: "deposit_paid" | "paid" = "deposit_paid";
        if (paymentType === "full" || newPaid >= total) {
          paymentStatus = "paid";
        } else if (newPaid >= deposit) {
          paymentStatus = "deposit_paid";
        }

        const siteSettings = await getSiteSettings();
        const { appointment: workflow } = getOperationalSettings(siteSettings);

        const updatePayload: Record<string, unknown> = {
          amount_paid_cents: newPaid,
          payment_status: paymentStatus,
        };

        if (isQuoteConfirm) {
          updatePayload.status = "confirmed";
          updatePayload.payment_method = "stripe";
          updatePayload.quote_confirmed_at = new Date().toISOString();
          updatePayload.quote_confirm_token = null;
        } else if (workflow.autoConfirmOnDepositPaid) {
          updatePayload.status = "confirmed";
        }

        let updateQuery = admin.from("appointments").update(updatePayload).eq("id", appointmentId);
        if (isQuoteConfirm && quoteConfirmToken) {
          updateQuery = updateQuery.eq("quote_confirm_token", quoteConfirmToken);
        }
        await updateQuery;

        if (
          isQuoteConfirm &&
          appointment &&
          appointment.status !== "confirmed" &&
          appointment.customer_email
        ) {
          try {
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
          } catch (emailErr) {
            console.error("[stripe webhook quote confirm email]", emailErr);
          }
        }
      } catch (err) {
        console.error("[stripe webhook update]", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
