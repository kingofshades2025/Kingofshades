"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import type { AppointmentStatus, GalleryCategory } from "@/lib/types/database";

type ActionResult = { success: true } | { success: false; error: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertService(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { success: false, error: "Title is required." };

  const payload = {
    slug: (formData.get("slug") as string)?.trim() || slugify(title),
    title,
    tagline: (formData.get("tagline") as string)?.trim() || null,
    description: (formData.get("description") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || "general",
    price_label: (formData.get("price_label") as string)?.trim() || null,
    accent: (formData.get("accent") as string)?.trim() || null,
    is_active: formData.get("is_active") === "true",
    benefits: parseBenefits(formData),
    features: parseFeatures(formData),
    featured_image_url: (formData.get("featured_image_url") as string)?.trim() || null,
  };

  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { success: true };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  internalNotes?: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("appointments")
    .update({
      status,
      ...(internalNotes !== undefined ? { internal_notes: internalNotes } : {}),
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  return { success: true };
}

export async function upsertCustomer(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  if (!name || !email) return { success: false, error: "Name and email are required." };

  const payload = {
    name,
    email,
    phone: (formData.get("phone") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
  };

  const { error } = id
    ? await supabase.from("customers").update(payload).eq("id", id)
    : await supabase.from("customers").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function upsertGalleryItem(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as GalleryCategory;
  if (!title || !category) return { success: false, error: "Title and category are required." };

  const payload = {
    title,
    category,
    description: (formData.get("description") as string)?.trim() || null,
    tint: (formData.get("tint") as string)?.trim() || null,
    image_url: (formData.get("image_url") as string)?.trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const { error } = id
    ? await supabase.from("gallery_items").update(payload).eq("id", id)
    : await supabase.from("gallery_items").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function upsertTestimonial(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string | null;
  const customer_name = (formData.get("customer_name") as string)?.trim();
  const review = (formData.get("review") as string)?.trim();
  if (!customer_name || !review) return { success: false, error: "Name and review are required." };

  const payload = {
    customer_name,
    review,
    role: (formData.get("role") as string)?.trim() || null,
    rating: Number(formData.get("rating") || 5),
    is_approved: formData.get("is_approved") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const { error } = id
    ? await supabase.from("testimonials").update(payload).eq("id", id)
    : await supabase.from("testimonials").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function saveSiteSettings(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string | null;

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
      : JSON.parse((formData.get("social_links") as string) || "[]"),
    business_hours: business_hours.length
      ? business_hours
      : JSON.parse((formData.get("business_hours") as string) || "[]"),
  };

  const { error } = id
    ? await supabase.from("site_settings").update(payload).eq("id", id)
    : await supabase.from("site_settings").insert(payload);

  if (error) return { success: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { success: true };
}

function parseBenefits(formData: FormData) {
  const lines = (formData.get("benefits_lines") as string)?.trim();
  if (lines) {
    return lines.split("\n").map((l) => l.trim()).filter(Boolean);
  }
  return JSON.parse((formData.get("benefits") as string) || "[]");
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
  return JSON.parse((formData.get("features") as string) || "[]");
}

export async function saveContentSection(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const section_key = (formData.get("section_key") as string)?.trim();
  if (!section_key) return { success: false, error: "Section key is required." };

  const payload = {
    section_key,
    title: (formData.get("title") as string)?.trim() || null,
    body: (formData.get("body") as string)?.trim() || null,
    metadata: JSON.parse((formData.get("metadata") as string) || "{}"),
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
}

export async function uploadGalleryImage(formData: FormData): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { upsert: false });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
