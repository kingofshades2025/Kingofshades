import type {
  BookingSettings,
  NotificationSettings,
  PaymentSettings,
} from "@/lib/types/database";

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  slotDurationMinutes: 120,
  bufferMinutes: 15,
  maxDailyAppointments: 8,
  closedWeekdays: [0],
  weekdayStart: "08:00",
  weekdayEnd: "18:00",
  saturdayStart: "09:00",
  saturdayEnd: "16:00",
  sundayClosed: true,
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  acceptDeposits: true,
  acceptFullPayment: true,
  depositPercent: 25,
  taxRatePercent: 8.875,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailRemindersEnabled: true,
  reminder24hEnabled: true,
  reminder2hEnabled: true,
  smsEnabled: false,
};

export const TINT_TYPES = [
  { id: "carbon", label: "Carbon", multiplier: 1 },
  { id: "ceramic", label: "Ceramic", multiplier: 1.25 },
  { id: "premium-ceramic", label: "Premium Ceramic", multiplier: 1.45 },
] as const;

export const CUSTOM_QUOTE_SERVICE = {
  id: "custom-quote",
  title: "Custom Quote",
  description: "Not sure what you need? Tell us about your project.",
  icon: "sticker" as const,
  from: "Free estimate",
};
