export type AdminRole = "admin" | "super_admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "deposit_paid" | "paid" | "refunded";

export type QuoteStatus =
  | "new"
  | "reviewing"
  | "quote_sent"
  | "approved"
  | "rejected";

export type PaymentRecordStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentType = "deposit" | "full" | "refund" | "invoice";

export type BookingSettings = {
  slotDurationMinutes: number;
  bufferMinutes: number;
  maxDailyAppointments: number;
  closedWeekdays: number[];
  weekdayStart: string;
  weekdayEnd: string;
  saturdayStart: string;
  saturdayEnd: string;
  sundayClosed: boolean;
};

export type PaymentSettings = {
  acceptDeposits: boolean;
  acceptFullPayment: boolean;
  depositPercent: number;
  taxRatePercent: number;
};

export type NotificationSettings = {
  emailRemindersEnabled: boolean;
  reminder24hEnabled: boolean;
  reminder2hEnabled: boolean;
  smsEnabled: boolean;
};

export type GalleryCategory =
  | "Cars"
  | "Trucks"
  | "SUVs"
  | "Residential"
  | "Commercial"
  | "Decals";

export type ServiceFeature = { name: string; detail: string };

export type SocialLink = { label: string; href: string; icon: string };

export type BusinessHour = { day: string; time: string };

export type AdminProfile = {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  category: string;
  price_label: string | null;
  price_cents: number | null;
  benefits: string[];
  features: ServiceFeature[];
  featured_image_url: string | null;
  detail_image_url: string | null;
  finish_image_url: string | null;
  accent: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  auth_user_id?: string | null;
  stripe_customer_id?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  customer_id: string | null;
  service_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address?: string | null;
  service_title: string;
  appointment_number?: string | null;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  internal_notes: string | null;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  total_cents?: number | null;
  deposit_cents?: number | null;
  amount_paid_cents?: number;
  duration_minutes?: number;
  stripe_checkout_session_id?: string | null;
  details: Record<string, string>;
  created_at: string;
  updated_at: string;
  customers?: Customer | null;
  services?: Service | null;
};

export type Payment = {
  id: string;
  appointment_id: string | null;
  customer_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentRecordStatus;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type QuoteRequest = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_type: string;
  description: string;
  measurements: string | null;
  photo_urls: string[];
  status: QuoteStatus;
  quoted_amount_cents: number | null;
  admin_notes: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  image_url: string | null;
  category: GalleryCategory;
  title: string;
  description: string | null;
  tint: string | null;
  sort_order: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  role: string | null;
  review: string;
  rating: number;
  is_approved: boolean;
  sort_order: number;
  created_at: string;
};

export type SiteSettings = {
  id: string;
  business_name: string;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  social_links: SocialLink[];
  business_hours: BusinessHour[];
  booking_settings?: BookingSettings;
  payment_settings?: PaymentSettings;
  notification_settings?: NotificationSettings;
  updated_at: string;
};

export type ContentSection = {
  id: string;
  section_key: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  updated_at: string;
};
