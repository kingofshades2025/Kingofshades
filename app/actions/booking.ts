"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAvailableTimeSlots } from "@/app/actions/availability";
import { generateAppointmentNumber, buildPriceBreakdown, type PriceBreakdownLine } from "@/lib/booking/pricing";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getSiteSettings } from "@/lib/queries/public";
import { getBusinessAddressLines } from "@/lib/site-config";
import {
  sendEmail,
  getEmailTo,
  bookingNotificationHtml,
  bookingRequestReceivedHtml,
} from "@/lib/email";
import { upsertCustomerFromContact } from "@/lib/customers/upsert";
import type { QuoteLineItem } from "@/lib/types/database";

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

function breakdownToQuoteItems(lines: PriceBreakdownLine[]): QuoteLineItem[] {
  return lines.map((line) => ({ label: line.label, amount_cents: line.amountCents }));
}

function parseAppointmentDate(dateIso: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return dateIso;
  return null;
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

  try {
    if (isSupabaseConfigured()) {
      const admin = createAdminClient();
      const settings = await getSiteSettings();
      const { booking, payment } = getOperationalSettings(settings);

      const { customerId, error: customerError } = await upsertCustomerFromContact(admin, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
      });
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

      const pricingBreakdown = buildPriceBreakdown({
        basePriceCents,
        tintType: payload.tintType ?? payload.tint,
        windowCount: payload.windowCount,
        paymentSettings: payment,
        serviceTitle: service,
      });
      const pricing = pricingBreakdown.estimate;

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
          status: "requested",
          payment_status: "unpaid",
          total_cents: pricing.totalCents,
          deposit_cents: pricing.depositCents,
          amount_paid_cents: 0,
          duration_minutes: booking.slotDurationMinutes,
          estimate_line_items: breakdownToQuoteItems(pricingBreakdown.lines),
          details,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "That time slot was just booked. Please choose another." };
        }
        console.error("[booking] db insert", error.message);
        return { success: false, error: "Could not save your request. Please try again or call us." };
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
        subject: `Booking request received — ${appointmentNumber ?? "King of Shades"}`,
        html: bookingRequestReceivedHtml({
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
            "Request saved — we'll follow up by email soon. (Confirmation email could not be sent.)",
        };
      }
      throw emailErr;
    }

    return { success: true, appointmentId, appointmentNumber };
  } catch (err) {
    console.error("[booking]", err);
    return {
      success: false,
      error: "Could not submit your request. Please try again or contact us directly.",
    };
  }
}
