import { createClient } from "@/lib/supabase/server";
import type { Appointment, Customer, Service, GalleryItem, Testimonial, SiteSettings, ContentSection, Payment, QuoteRequest, BlockedDate } from "@/lib/types/database";

export async function getAdminServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");

  if (error?.message?.includes("detail_image_url") || error?.message?.includes("finish_image_url")) {
    const legacy = await supabase
      .from("services")
      .select("id, slug, title, tagline, description, category, price_label, price_cents, benefits, features, featured_image_url, accent, is_active, sort_order, created_at, updated_at")
      .order("sort_order");
    if (legacy.error) throw new Error(legacy.error.message);
    return (legacy.data ?? []).map((row) => ({
      ...row,
      detail_image_url: null,
      finish_image_url: null,
    })) as Service[];
  }

  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function getAdminAppointments(filters?: { status?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, customers(*), services(*)")
    .order("appointment_date", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as Appointment[];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (a) =>
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_email.toLowerCase().includes(q) ||
        a.service_title.toLowerCase().includes(q),
    );
  }
  return rows;
}

export async function getAdminCustomers(search?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as Customer[];
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q),
    );
  }
  return rows;
}

export async function getAdminGallery() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryItem[];
}

export async function getAdminTestimonials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
}

export async function getAdminSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data as SiteSettings | null;
}

export async function getAdminContentSections() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_sections").select("*").order("section_key");
  if (error) throw new Error(error.message);
  return (data ?? []) as ContentSection[];
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const [appointments, customers, services, upcoming] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .in("status", ["requested", "quote_sent", "confirmed"])
      .gte("appointment_date", new Date().toISOString().slice(0, 10)),
  ]);

  return {
    totalAppointments: appointments.count ?? 0,
    totalCustomers: customers.count ?? 0,
    activeServices: services.count ?? 0,
    upcomingAppointments: upcoming.count ?? 0,
  };
}

export async function getCustomerAppointmentCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("customer_id")
    .not("customer_id", "is", null);
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.customer_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function getCustomerAppointments(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .order("appointment_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function getAdminPayments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, appointments(customer_name, service_title, appointment_number)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function getAdminQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as QuoteRequest[];
}

export async function getBlockedDates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("blocked_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlockedDate[];
}

export async function getPaymentSummary() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from("payments")
    .select("amount_cents, status, payment_type, created_at")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const rows = data ?? [];
  const succeeded = rows.filter((r) => r.status === "succeeded");
  const revenueCents = succeeded.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);
  const refundedCents = rows
    .filter((r) => r.status === "refunded" || r.payment_type === "refund")
    .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);

  return {
    revenueCents,
    refundedCents,
    transactionCount: succeeded.length,
    pendingCount: rows.filter((r) => r.status === "pending").length,
  };
}
