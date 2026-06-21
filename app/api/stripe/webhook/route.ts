import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe";
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
    const paymentType = session.metadata?.paymentType ?? "deposit";

    if (appointmentId) {
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
          .select("amount_paid_cents, total_cents, deposit_cents")
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

        await admin
          .from("appointments")
          .update({
            amount_paid_cents: newPaid,
            payment_status: paymentStatus,
            status: "confirmed",
          })
          .eq("id", appointmentId);
      } catch (err) {
        console.error("[stripe webhook update]", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
