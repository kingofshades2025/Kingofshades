"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAvailableTimeSlots } from "@/app/actions/availability";
import { createAppointmentCheckout } from "@/app/actions/payments";
import { generateAppointmentNumber, estimatePrice } from "@/lib/booking/pricing";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getSiteSettings } from "@/lib/queries/public";
import { getBusinessAddressLines } from "@/lib/site-config";
import {
  sendEmail,
  getEmailTo,
  bookingNotificationHtml,
  bookingConfirmationHtml,
} from "@/lib/email";

export type BookingPayload = {
  service: string;
  serviceSlug?: string;
  tint: string;
  tintType?: string;
  date: string;
  dateIso: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes: string;
  details: Record<string, string>;
  photoUrls?: string[];
  paymentMode?: "none" | "deposit" | "full";
  windowCount?: number;
};

export type BookingResult =
  | {
      success: true;
      warning?: string;
      appointmentId?: string;
      appointmentNumber?: string;
      checkoutUrl?: string;
    }
  | { success: false; error: string };

function parseAppointmentDate(dateIso: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return dateIso;
  return null;
}

function resolvePaymentMode(
  mode: BookingPayload["paymentMode"],
  payment: ReturnType<typeof getOperationalSettings>["payment"],
): "none" | "deposit" | "full" {
  if (!mode || mode === "none") return "none";
  if (mode === "deposit" && payment.acceptDeposits) return "deposit";
  if (mode === "full" && payment.acceptFullPayment) return "full";
  return "none";
}

async function upsertBookingCustomer(
  admin: ReturnType<typeof createAdminClient>,
  payload: BookingPayload,
): Promise<{ customerId: string | null; error?: string }> {
  const { data: customerId, error: rpcErr } = await admin.rpc("upsert_booking_customer", {
    p_name: payload.name.trim(),
    p_email: payload.email.trim(),
    p_phone: payload.phone.trim() || null,
    p_address: payload.address?.trim() || null,
  });

  if (!rpcErr && customerId) {
    return { customerId: customerId as string };
  }

  if (rpcErr) {
    console.error("[booking] customer rpc", rpcErr.message);
  }

  const email = payload.email.trim();
  const { data: existing } = await admin
    .from("customers")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existing?.id) {
    await admin
      .from("customers")
      .update({
        name: payload.name.trim(),
        phone: payload.phone.trim() || null,
        address: payload.address?.trim() || null,
      })
      .eq("id", existing.id);
    return { customerId: existing.id };
  }

  const { data: created, error: insertErr } = await admin
    .from("customers")
    .insert({
      name: payload.name.trim(),
      email,
      phone: payload.phone.trim() || null,
      address: payload.address?.trim() || null,
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    return {
      customerId: null,
      error: insertErr?.message ?? "Could not save customer record.",
    };
  }

  return { customerId: created.id };
}

export async function submitBooking(payload: BookingPayload): Promise<BookingResult> {
  const { name, email, service, date, dateIso, time } = payload;

  if (!name?.trim() || !email?.trim() || !service?.trim()) {
    return { success: false, error: "Name, email, and service are required." };
  }

  if (!date?.trim() || !time?.trim() || !dateIso?.trim()) {
    return { success: false, error: "Please select a date and time." };
  }

  const appointmentDate = parseAppointmentDate(dateIso);
  if (!appointmentDate) {
    return { success: false, error: "Invalid appointment date." };
  }

  const availability = await getAvailableTimeSlots(appointmentDate);
  if (availability.closed || !availability.slots.includes(time)) {
    return {
      success: false,
      error: availability.error ?? "That time slot is no longer available. Please pick another.",
    };
  }

  let savedToDb = false;
  let appointmentId: string | undefined;
  let appointmentNumber: string | undefined;
  let paymentMode: "none" | "deposit" | "full" = "none";

  try {
    if (isSupabaseConfigured()) {
      const admin = createAdminClient();
      const settings = await getSiteSettings();
      const { booking, payment } = getOperationalSettings(settings);
      paymentMode = resolvePaymentMode(payload.paymentMode, payment);

      const { customerId, error: customerError } = await upsertBookingCustomer(admin, payload);
      if (customerError) {
        return { success: false, error: "Could not save your contact information. Please try again." };
      }

      let serviceId: string | null = null;
      let basePriceCents: number | null = null;
      if (payload.serviceSlug && payload.serviceSlug !== "custom-quote") {
        const { data: svc } = await admin
          .from("services")
          .select("id, price_cents")
          .eq("slug", payload.serviceSlug)
          .maybeSingle();
        serviceId = svc?.id ?? null;
        basePriceCents = svc?.price_cents ?? null;
      }

      const pricing = estimatePrice({
        basePriceCents,
        tintType: payload.tintType ?? payload.tint,
        windowCount: payload.windowCount,
        paymentSettings: payment,
      });

      appointmentNumber = generateAppointmentNumber();

      const details: Record<string, string | string[]> = {
        ...payload.details,
        ...(payload.tint ? { "Tint percentage": payload.tint } : {}),
        ...(payload.tintType ? { "Tint type": payload.tintType } : {}),
        ...(payload.photoUrls?.length ? { photo_urls: payload.photoUrls } : {}),
      };

      const { data: created, error } = await admin
        .from("appointments")
        .insert({
          customer_id: customerId,
          service_id: serviceId,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: payload.phone.trim() || null,
          customer_address: payload.address?.trim() || null,
          service_title: service,
          appointment_number: appointmentNumber,
          appointment_date: appointmentDate,
          appointment_time: time,
          notes: payload.notes.trim() || null,
          status: "pending",
          payment_status: "unpaid",
          total_cents: pricing.totalCents,
          deposit_cents: pricing.depositCents,
          amount_paid_cents: 0,
          duration_minutes: booking.slotDurationMinutes,
          details,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "That time slot was just booked. Please choose another." };
        }
        console.error("[booking] db insert", error.message);
        return { success: false, error: "Could not save your booking. Please try again or call us." };
      }

      appointmentId = created.id;
      savedToDb = true;
    }

    try {
      const siteSettings = await getSiteSettings();
      const businessAddress = getBusinessAddressLines(siteSettings);

      await sendEmail({
        to: getEmailTo(),
        subject: `New booking ${appointmentNumber ?? ""}: ${name} — ${service}`,
        html: bookingNotificationHtml({ ...payload, appointmentNumber, photoUrls: payload.photoUrls }),
        replyTo: email,
      });

      await sendEmail({
        to: email,
        subject: `Booking confirmed — ${appointmentNumber ?? "King of Shades"}`,
        html: bookingConfirmationHtml({
          name,
          service,
          date,
          time,
          appointmentNumber,
          addressLine1: businessAddress.line1,
          addressLine2: businessAddress.line2,
        }),
      });
    } catch (emailErr) {
      console.error("[booking] email", emailErr);
      if (savedToDb) {
        return {
          success: true,
          appointmentId,
          appointmentNumber,
          warning:
            "Booking saved — we'll confirm by email soon. (Confirmation email could not be sent.)",
        };
      }
      throw emailErr;
    }

    if (savedToDb && appointmentId && paymentMode !== "none") {
      const checkout = await createAppointmentCheckout({
        appointmentId,
        paymentType: paymentMode,
      });
      if (checkout.success) {
        return {
          success: true,
          appointmentId,
          appointmentNumber,
          checkoutUrl: checkout.url,
        };
      }
      return {
        success: true,
        appointmentId,
        appointmentNumber,
        warning: `Booking saved, but payment could not start: ${checkout.error}`,
      };
    }

    return { success: true, appointmentId, appointmentNumber };
  } catch (err) {
    console.error("[booking]", err);
    return {
      success: false,
      error: "Could not submit your booking. Please try again or contact us directly.",
    };
  }
}
