"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  details: Record<string, string>;
};

export type BookingResult =
  | { success: true }
  | { success: false; error: string };

function parseAppointmentDate(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export async function submitBooking(
  payload: BookingPayload,
): Promise<BookingResult> {
  const { name, email, service, date, time } = payload;

  if (!name?.trim() || !email?.trim() || !service?.trim()) {
    return { success: false, error: "Name, email, and service are required." };
  }

  if (!date?.trim() || !time?.trim()) {
    return { success: false, error: "Please select a date and time." };
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      let customerId: string | null = null;
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", email.trim())
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
        await supabase
          .from("customers")
          .update({
            name: name.trim(),
            phone: payload.phone.trim() || null,
          })
          .eq("id", customerId);
      } else {
        const { data: created } = await supabase
          .from("customers")
          .insert({
            name: name.trim(),
            email: email.trim(),
            phone: payload.phone.trim() || null,
          })
          .select("id")
          .single();
        customerId = created?.id ?? null;
      }

      let serviceId: string | null = null;
      if (payload.serviceSlug) {
        const { data: svc } = await supabase
          .from("services")
          .select("id")
          .eq("slug", payload.serviceSlug)
          .maybeSingle();
        serviceId = svc?.id ?? null;
      }

      await supabase.from("appointments").insert({
        customer_id: customerId,
        service_id: serviceId,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: payload.phone.trim() || null,
        service_title: service,
        appointment_date: parseAppointmentDate(date),
        appointment_time: time,
        notes: payload.notes.trim() || null,
        status: "pending",
        payment_status: "unpaid",
        details: payload.details,
      });
    }

    await sendEmail({
      to: getEmailTo(),
      subject: `New booking: ${name} — ${service}`,
      html: bookingNotificationHtml(payload),
      replyTo: email,
    });

    await sendEmail({
      to: email,
      subject: "Booking request received — King of Shades",
      html: bookingConfirmationHtml({ name, service, date, time }),
    });

    return { success: true };
  } catch (err) {
    console.error("[booking]", err);
    return {
      success: false,
      error: "Could not submit your booking. Please try again or contact us directly.",
    };
  }
}
