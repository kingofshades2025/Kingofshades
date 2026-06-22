"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppointmentStatus, GalleryCategory, QuoteStatus } from "@/lib/types/database";
import { sendEmail, appointmentConfirmedHtml, quoteSentHtml, serviceCompletedHtml } from "@/lib/email";
import { getSiteBaseUrl } from "@/lib/app-url";
import { formatMoney } from "@/lib/booking/pricing";
import { createQuoteCheckout } from "@/app/actions/payments";

export type ActionResult = { success: true } | { success: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID_RE.test(value));
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function logActionError(action: string, err: unknown) {
  console.error(`[admin:${action}]`, err instanceof Error ? err.message : err);
}

function parseBenefits(formData: FormData) {
  const lines = (formData.get("benefits_lines") as string)?.trim();
  if (lines) {
    return lines.split("\n").map((l) => l.trim()).filter(Boolean);
  }
  return safeJsonParse<string[]>((formData.get("benefits") as string) ?? "[]", []);
}

function parseFeatures(formData: FormData) {
  const lines = (formData.get("features_lines") as string)?.trim();
  if (lines) {
    return lines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, detail] = line.split("|").map((p) => p.trim());
        return { name: name ?? "", detail: detail ?? "" };
      })
      .filter((f) => f.name);
  }
  return safeJsonParse<{ name: string; detail: string }[]>(
    (formData.get("features") as string) ?? "[]",
    [],
  );
}

export async function upsertService(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const id = (formData.get("id") as string | null)?.trim() || null;
    const title = (formData.get("title") as string)?.trim();
    if (!title) return { success: false, error: "Title is required." };

    const accent =
      (formData.get("accent") as string)?.trim() ||
      (formData.get("category") as string)?.trim() ||
      "automotive";

    const priceDollarsRaw = (formData.get("price_dollars") as string)?.trim();
    const priceCents =
      priceDollarsRaw && !Number.isNaN(Number(priceDollarsRaw))
        ? Math.round(Number(priceDollarsRaw) * 100)
        : null;

    const payload = {
      slug: (formData.get("slug") as string)?.trim() || slugify(title),
      title,
      tagline: (formData.get("tagline") as string)?.trim() || null,
      description: (formData.get("description") as string)?.trim() || null,
      category: accent,
      price_label: (formData.get("price_label") as string)?.trim() || null,
      price_cents: priceCents,
      accent,
      is_active: formData.get("is_active") === "true",
      benefits: parseBenefits(formData),
      features: parseFeatures(formData),
      featured_image_url: (formData.get("featured_image_url") as string)?.trim() || null,
      detail_image_url: (formData.get("detail_image_url") as string)?.trim() || null,
      finish_image_url: (formData.get("finish_image_url") as string)?.trim() || null,
    };

    if (id && !isUuid(id)) {
      return {
        success: false,
        error: "Invalid service record. Refresh the page and try again.",
      };
    }

    const { error } = id
      ? await supabase.from("services").update(payload).eq("id", id)
      : await supabase.from("services").insert(payload);

    if (error?.message?.includes("detail_image_url") || error?.message?.includes("finish_image_url")) {
      const { detail_image_url: _d, finish_image_url: _f, ...legacyPayload } = payload;
      const retry = id
        ? await supabase.from("services").update(legacyPayload).eq("id", id)
        : await supabase.from("services").insert(legacyPayload);
      if (retry.error) return { success: false, error: retry.error.message };
    } else if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (err) {
    logActionError("upsertService", err);
    return { success: false, error: "Could not save service. Please try again." };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) {
      return { success: false, error: "Invalid service ID." };
    }
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (err) {
    logActionError("deleteService", err);
    return { success: false, error: "Could not delete service." };
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  internalNotes?: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: existing } = await supabase
      .from("appointments")
      .select("customer_name, customer_email, service_title, appointment_date, appointment_time, appointment_number, status, review_submitted_at")
      .eq("id", id)
      .maybeSingle();

    const transitioningToCompleted =
      existing && status === "completed" && existing.status !== "completed";
    const reviewToken =
      transitioningToCompleted && !existing.review_submitted_at
        ? crypto.randomUUID()
        : undefined;

    const { error } = await supabase
      .from("appointments")
      .update({
        status,
        ...(internalNotes !== undefined ? { internal_notes: internalNotes } : {}),
        ...(reviewToken ? { review_token: reviewToken } : {}),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    if (existing && status === "confirmed" && existing.status !== "confirmed") {
      try {
        await sendEmail({
          to: existing.customer_email,
          subject: `Appointment confirmed — ${existing.appointment_number ?? "King of Shades"}`,
          html: appointmentConfirmedHtml({
            name: existing.customer_name,
            service: existing.service_title,
            date: existing.appointment_date,
            time: existing.appointment_time,
            appointmentNumber: existing.appointment_number ?? undefined,
          }),
        });
      } catch (emailErr) {
        console.error("[updateAppointmentStatus] email", emailErr);
      }
    }

    if (transitioningToCompleted && reviewToken) {
      try {
        const reviewUrl = `${getSiteBaseUrl()}/review?token=${reviewToken}`;
        await sendEmail({
          to: existing.customer_email,
          subject: "Your vehicle is ready — King of Shades",
          html: serviceCompletedHtml({
            name: existing.customer_name,
            service: existing.service_title,
            reviewUrl,
            appointmentNumber: existing.appointment_number ?? undefined,
          }),
        });
        await supabase
          .from("appointments")
          .update({ review_email_sent_at: new Date().toISOString() })
          .eq("id", id);
      } catch (emailErr) {
        console.error("[updateAppointmentStatus] completion email", emailErr);
      }
    }

    revalidatePath("/admin/appointments");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    logActionError("updateAppointmentStatus", err);
    return { success: false, error: "Could not update appointment." };
  }
}

export async function upsertCustomer(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const id = (formData.get("id") as string | null)?.trim() || null;
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    if (!name || !email) return { success: false, error: "Name and email are required." };

    if (id && !isUuid(id)) {
      return {
        success: false,
        error: "Invalid customer record. Refresh the page and try again.",
      };
    }

    const payload = {
      name,
      email,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    };

    const { error } = id
      ? await supabase.from("customers").update(payload).eq("id", id)
      : await supabase.from("customers").insert(payload);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (err) {
    logActionError("upsertCustomer", err);
    return { success: false, error: "Could not save customer." };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid customer ID." };
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") {
        return {
          success: false,
          error:
            "This customer is linked to other records that could not be updated. Remove those links first.",
        };
      }
      if (error.message?.toLowerCase().includes("permission denied")) {
        return {
          success: false,
          error: "Delete permission is not configured. Contact support or run the latest database migration.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/customers");
    revalidatePath("/admin/appointments");
    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (err) {
    logActionError("deleteCustomer", err);
    return { success: false, error: "Could not delete customer." };
  }
}

export async function upsertGalleryItem(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const id = (formData.get("id") as string | null)?.trim() || null;
    const title = (formData.get("title") as string)?.trim();
    const category = formData.get("category") as GalleryCategory;
    if (!title || !category) {
      return { success: false, error: "Title and category are required." };
    }

    const payload = {
      title,
      category,
      description: (formData.get("description") as string)?.trim() || null,
      tint: (formData.get("tint") as string)?.trim() || null,
      image_url: (formData.get("image_url") as string)?.trim() || null,
      sort_order: Number(formData.get("sort_order") || 0),
    };

    const { error } = id && isUuid(id)
      ? await supabase.from("gallery_items").update(payload).eq("id", id)
      : await supabase.from("gallery_items").insert(payload);

    if (error) return { success: false, error: error.message };
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (err) {
    logActionError("upsertGalleryItem", err);
    return { success: false, error: "Could not save gallery item." };
  }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid gallery item ID." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (err) {
    logActionError("deleteGalleryItem", err);
    return { success: false, error: "Could not delete gallery item." };
  }
}

export async function upsertTestimonial(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const id = (formData.get("id") as string | null)?.trim() || null;
    const customer_name = (formData.get("customer_name") as string)?.trim();
    const review = (formData.get("review") as string)?.trim();
    if (!customer_name || !review) {
      return { success: false, error: "Name and review are required." };
    }

    const payload = {
      customer_name,
      review,
      role: (formData.get("role") as string)?.trim() || null,
      rating: Number(formData.get("rating") || 5),
      is_approved: formData.get("is_approved") === "true",
      sort_order: Number(formData.get("sort_order") || 0),
    };

    const { error } = id && isUuid(id)
      ? await supabase.from("testimonials").update(payload).eq("id", id)
      : await supabase.from("testimonials").insert(payload);

    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    logActionError("upsertTestimonial", err);
    return { success: false, error: "Could not save testimonial." };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid testimonial ID." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    logActionError("deleteTestimonial", err);
    return { success: false, error: "Could not delete testimonial." };
  }
}

export async function saveSiteSettings(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const id = (formData.get("id") as string | null)?.trim() || null;

    const hoursLines = (formData.get("business_hours_lines") as string) ?? "";
    const socialLines = (formData.get("social_links_lines") as string) ?? "";

    const business_hours = hoursLines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [day, time] = line.split("|").map((p) => p.trim());
        return { day: day ?? "", time: time ?? "" };
      })
      .filter((h) => h.day);

    const social_links = socialLines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href, icon] = line.split("|").map((p) => p.trim());
        return { label: label ?? "", href: href ?? "#", icon: icon ?? "instagram" };
      })
      .filter((s) => s.label);

    const payload = {
      business_name: (formData.get("business_name") as string)?.trim() || "King of Shades",
      phone: (formData.get("phone") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      address_line1: (formData.get("address_line1") as string)?.trim() || null,
      address_line2: (formData.get("address_line2") as string)?.trim() || null,
      social_links: social_links.length
        ? social_links
        : safeJsonParse((formData.get("social_links") as string) ?? "[]", []),
      business_hours: business_hours.length
        ? business_hours
        : safeJsonParse((formData.get("business_hours") as string) ?? "[]", []),
      booking_settings: {
        slotDurationMinutes: Number(formData.get("slot_duration") || 120),
        bufferMinutes: Number(formData.get("buffer_minutes") || 15),
        maxDailyAppointments: Number(formData.get("max_daily_appointments") || 8),
        closedWeekdays: [0],
        weekdayStart: (formData.get("weekday_start") as string)?.trim() || "08:00",
        weekdayEnd: (formData.get("weekday_end") as string)?.trim() || "18:00",
        saturdayStart: (formData.get("saturday_start") as string)?.trim() || "09:00",
        saturdayEnd: (formData.get("saturday_end") as string)?.trim() || "16:00",
        sundayClosed: formData.get("sunday_closed") === "true",
      },
      payment_settings: {
        acceptDeposits: formData.get("accept_deposits") === "true",
        acceptFullPayment: formData.get("accept_full_payment") === "true",
        depositPercent: Number(formData.get("deposit_percent") || 25),
        taxRatePercent: Number(formData.get("tax_rate_percent") || 8.875),
        fallbackBaseCents: Math.round(Number(formData.get("fallback_base_dollars") || 199) * 100),
        windowFactorPerWindow: Number(formData.get("window_factor_per_window") || 0.15),
        windowFactorBase: Number(formData.get("window_factor_base") || 0.85),
        windowFactorMax: Number(formData.get("window_factor_max") || 2.5),
        tintCarbonMultiplier: Number(formData.get("tint_carbon_multiplier") || 1),
        tintCeramicMultiplier: Number(formData.get("tint_ceramic_multiplier") || 1.25),
        tintPremiumMultiplier: Number(formData.get("tint_premium_multiplier") || 1.45),
      },
      notification_settings: {
        emailRemindersEnabled: formData.get("email_reminders_enabled") === "true",
        reminder24hEnabled: formData.get("reminder_24h_enabled") === "true",
        reminder2hEnabled: formData.get("reminder_2h_enabled") === "true",
        smsEnabled: formData.get("sms_enabled") === "true",
      },
    };

    const { error } = id && isUuid(id)
      ? await supabase.from("site_settings").update(payload).eq("id", id)
      : await supabase.from("site_settings").insert(payload);

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    logActionError("saveSiteSettings", err);
    return { success: false, error: "Could not save settings." };
  }
}

export async function saveContentSection(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const section_key = (formData.get("section_key") as string)?.trim();
    if (!section_key) return { success: false, error: "Section key is required." };

    const incomingMetadata = safeJsonParse<Record<string, unknown>>(
      (formData.get("metadata") as string) ?? "{}",
      {},
    );

    const { data: existing } = await supabase
      .from("content_sections")
      .select("metadata")
      .eq("section_key", section_key)
      .maybeSingle();

    const mergedMetadata = {
      ...(existing?.metadata ?? {}),
      ...incomingMetadata,
    };

    const payload = {
      section_key,
      title: (formData.get("title") as string)?.trim() || null,
      body: (formData.get("body") as string)?.trim() || null,
      metadata: mergedMetadata,
    };

    const { error } = await supabase
      .from("content_sections")
      .upsert(payload, { onConflict: "section_key" });

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    revalidatePath("/services");
    revalidatePath("/gallery");
    revalidatePath("/contact");
    revalidatePath("/booking");
    revalidatePath("/admin/content");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    logActionError("saveContentSection", err);
    return { success: false, error: "Could not save content section." };
  }
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadSiteImage(formData: FormData): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (file.size > MAX_UPLOAD_BYTES) {
      return { success: false, error: "Image must be 5 MB or smaller." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return { success: false, error: "Use JPG, PNG, WebP, or GIF." };
    }

    const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(path, file, { upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data } = supabase.storage.from("gallery").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (err) {
    logActionError("uploadSiteImage", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

/** @deprecated Use uploadSiteImage */
export async function uploadGalleryImage(formData: FormData): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  return uploadSiteImage(formData);
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  quotedAmountCents?: number,
  adminNotes?: string,
): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid quote ID." };
    const { supabase } = await requireAdmin();

    const { data: existing } = await supabase
      .from("quote_requests")
      .select("customer_name, customer_email, service_type, status, quoted_amount_cents")
      .eq("id", id)
      .maybeSingle();

    if (status === "quote_sent" && !quotedAmountCents && !existing?.quoted_amount_cents) {
      return { success: false, error: "Enter a quoted amount before sending the quote." };
    }

    const amount = quotedAmountCents ?? existing?.quoted_amount_cents ?? null;

    const { error } = await supabase
      .from("quote_requests")
      .update({
        status,
        ...(amount !== null ? { quoted_amount_cents: amount } : {}),
        ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
        ...(status === "quote_sent" ? { sent_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    if (
      existing &&
      status === "quote_sent" &&
      existing.status !== "quote_sent" &&
      existing.customer_email &&
      amount
    ) {
      try {
        const checkout = await createQuoteCheckout({ quoteId: id });
        await sendEmail({
          to: existing.customer_email,
          subject: `Your quote from King of Shades — ${existing.service_type}`,
          html: quoteSentHtml({
            name: existing.customer_name,
            serviceType: existing.service_type,
            quotedAmount: formatMoney(amount),
            notes: adminNotes,
            paymentUrl: checkout.success ? checkout.url : undefined,
          }),
        });
      } catch (emailErr) {
        console.error("[updateQuoteStatus] email", emailErr);
      }
    }

    revalidatePath("/admin/quotes");
    return { success: true };
  } catch (err) {
    logActionError("updateQuoteStatus", err);
    return { success: false, error: "Could not update quote." };
  }
}

export async function addBlockedDate(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const blocked_date = (formData.get("blocked_date") as string)?.trim();
    if (!blocked_date) return { success: false, error: "Date is required." };
    const { error } = await supabase.from("blocked_dates").insert({
      blocked_date,
      reason: (formData.get("reason") as string)?.trim() || null,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    logActionError("addBlockedDate", err);
    return { success: false, error: "Could not block date." };
  }
}

export async function deleteBlockedDate(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid blocked date ID." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    logActionError("deleteBlockedDate", err);
    return { success: false, error: "Could not remove blocked date." };
  }
}
