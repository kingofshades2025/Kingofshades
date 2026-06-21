export type AdminRole = "admin" | "super_admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "deposit_paid" | "paid" | "refunded";

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
  service_title: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  internal_notes: string | null;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  details: Record<string, string>;
  created_at: string;
  updated_at: string;
  customers?: Customer | null;
  services?: Service | null;
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
