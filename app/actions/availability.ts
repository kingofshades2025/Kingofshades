"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  filterAvailableSlots,
  generateTimeSlots,
  isPastDate,
  isClosedWeekday,
} from "@/lib/booking/availability";
import { getOperationalSettings } from "@/lib/booking/settings";
import { getSiteSettings } from "@/lib/queries/public";

export type AvailabilityResult = {
  slots: string[];
  closed: boolean;
  error?: string;
};

function fallbackSlots(dateIso: string, booking: ReturnType<typeof getOperationalSettings>["booking"]) {
  const date = new Date(`${dateIso}T12:00:00`);
  if (isClosedWeekday(date, booking)) {
    return { slots: [], closed: true };
  }
  return {
    slots: generateTimeSlots(booking, date).map((s) => s.time),
    closed: false,
  };
}

export async function getAvailableTimeSlots(dateIso: string): Promise<AvailabilityResult> {
  if (!dateIso || isPastDate(dateIso)) {
    return { slots: [], closed: true };
  }

  const settings = await getSiteSettings();
  const { booking } = getOperationalSettings(settings);
  const date = new Date(`${dateIso}T12:00:00`);

  if (isClosedWeekday(date, booking)) {
    return { slots: [], closed: true };
  }

  if (!isSupabaseConfigured()) {
    return fallbackSlots(dateIso, booking);
  }

  try {
    const admin = createAdminClient();

    let blocked = false;
    try {
      const { data, error } = await admin
        .from("blocked_dates")
        .select("id")
        .eq("blocked_date", dateIso)
        .maybeSingle();
      if (error?.message?.includes("blocked_dates")) {
        console.warn("[availability] blocked_dates unavailable, skipping");
      } else if (data) {
        blocked = true;
      }
    } catch {
      /* table may not exist pre-migration */
    }

    if (blocked) return { slots: [], closed: true };

    const { data: booked, count, error: bookedErr } = await admin
      .from("appointments")
      .select("appointment_time", { count: "exact" })
      .eq("appointment_date", dateIso)
      .in("status", ["confirmed", "in_progress", "completed"]);

    if (bookedErr) {
      console.error("[availability] appointments", bookedErr.message);
      return fallbackSlots(dateIso, booking);
    }

    if ((count ?? 0) >= booking.maxDailyAppointments) {
      return { slots: [], closed: true };
    }

    const allSlots = generateTimeSlots(booking, date);
    const bookedTimes = (booked ?? []).map((row) => row.appointment_time);
    const available = filterAvailableSlots(allSlots, bookedTimes, dateIso);

    return { slots: available.map((s) => s.time), closed: false };
  } catch (err) {
    console.error("[availability]", err);
    return { ...fallbackSlots(dateIso, booking), error: "Using default schedule." };
  }
}

export async function getBookingCalendarSettings() {
  const settings = await getSiteSettings();
  const { booking } = getOperationalSettings(settings);
  return {
    closedWeekdays: booking.closedWeekdays,
    sundayClosed: booking.sundayClosed,
  };
}

export async function getBlockedDatesForMonth(year: number, month: number) {
  if (!isSupabaseConfigured()) return [] as string[];

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0);
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("blocked_dates")
      .select("blocked_date")
      .gte("blocked_date", start)
      .lte("blocked_date", end);

    if (error) return [];
    return (data ?? []).map((row) => row.blocked_date);
  } catch {
    return [];
  }
}
