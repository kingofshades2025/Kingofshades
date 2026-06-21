import type { BookingSettings, BusinessHour } from "@/lib/types/database";

export type TimeSlot = {
  time: string;
  label: string;
};

function parseTime(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m || 0);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function isClosedWeekday(date: Date, settings: BookingSettings): boolean {
  const weekday = date.getDay();
  if (settings.closedWeekdays.includes(weekday)) return true;
  if (weekday === 0 && settings.sundayClosed) return true;
  return false;
}

function dayHours(date: Date, settings: BookingSettings): { start: number; end: number } | null {
  if (isClosedWeekday(date, settings)) return null;

  if (date.getDay() === 6) {
    return {
      start: parseTime(settings.saturdayStart),
      end: parseTime(settings.saturdayEnd),
    };
  }

  return {
    start: parseTime(settings.weekdayStart),
    end: parseTime(settings.weekdayEnd),
  };
}

export function generateTimeSlots(settings: BookingSettings, date: Date): TimeSlot[] {
  const hours = dayHours(date, settings);
  if (!hours) return [];

  const slots: TimeSlot[] = [];
  const step = settings.slotDurationMinutes + settings.bufferMinutes;

  for (let t = hours.start; t + settings.slotDurationMinutes <= hours.end; t += step) {
    const label = formatTime(t);
    slots.push({ time: label, label });
  }

  return slots;
}

export function isPastDate(dateIso: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateIso}T00:00:00`);
  return target < today;
}

export function toDateIso(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function formatDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function filterAvailableSlots(
  slots: TimeSlot[],
  bookedTimes: string[],
  dateIso: string,
): TimeSlot[] {
  const booked = new Set(bookedTimes.map((t) => t.trim()));
  const now = new Date();
  const isToday = toDateIso(now.getFullYear(), now.getMonth(), now.getDate()) === dateIso;

  return slots.filter((slot) => {
    if (booked.has(slot.time)) return false;
    if (!isToday) return true;

    const match = slot.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return true;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const slotDate = new Date();
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate.getTime() > now.getTime() + 30 * 60 * 1000;
  });
}

export function businessHoursToBookingSettings(
  hours: BusinessHour[],
  settings: BookingSettings,
): BookingSettings {
  return settings;
}
