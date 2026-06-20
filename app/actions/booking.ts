"use server";

import {
  sendEmail,
  getEmailTo,
  bookingNotificationHtml,
  bookingConfirmationHtml,
} from "@/lib/email";

export type BookingPayload = {
  service: string;
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
    await sendEmail({
      to: getEmailTo(),
      subject: `New booking: ${name} — ${service}`,
      html: bookingNotificationHtml(payload),
      replyTo: email,
    });

    await sendEmail({
      to: email,
      subject: "Booking request received — King of Shades",
      html: bookingConfirmationHtml({
        name,
        service,
        date,
        time,
      }),
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
