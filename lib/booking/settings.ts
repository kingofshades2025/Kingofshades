import type {
  BookingSettings,
  NotificationSettings,
  PaymentSettings,
  SiteSettings,
} from "@/lib/types/database";
import {
  DEFAULT_BOOKING_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
} from "@/lib/booking/defaults";

export function mergeBookingSettings(raw?: Partial<BookingSettings> | null): BookingSettings {
  return { ...DEFAULT_BOOKING_SETTINGS, ...(raw ?? {}) };
}

export function mergePaymentSettings(raw?: Partial<PaymentSettings> | null): PaymentSettings {
  return { ...DEFAULT_PAYMENT_SETTINGS, ...(raw ?? {}) };
}

export function mergeNotificationSettings(
  raw?: Partial<NotificationSettings> | null,
): NotificationSettings {
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...(raw ?? {}) };
}

export function getOperationalSettings(settings: SiteSettings | null) {
  return {
    booking: mergeBookingSettings(settings?.booking_settings),
    payment: mergePaymentSettings(settings?.payment_settings),
    notification: mergeNotificationSettings(settings?.notification_settings),
  };
}
