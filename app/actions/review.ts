"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAppointmentForReview } from "@/lib/queries/review";

export type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(formData: FormData): Promise<ReviewResult> {
  const token = (formData.get("token") as string | null)?.trim() ?? "";
  const customer_name = (formData.get("customer_name") as string | null)?.trim() ?? "";
  const review = (formData.get("review") as string | null)?.trim() ?? "";
  const rating = Number(formData.get("rating") || 0);

  if (!token) {
    return { success: false, error: "Invalid review link." };
  }

  if (!customer_name || !review) {
    return { success: false, error: "Name and review are required." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a star rating." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Reviews are temporarily unavailable." };
  }

  const lookup = await getAppointmentForReview(token);
  if (!lookup.ok) {
    if (lookup.reason === "submitted") {
      return { success: false, error: "You have already submitted a review for this appointment." };
    }
    return { success: false, error: "This review link is invalid or has expired." };
  }

  const supabase = createAdminClient();
  const role = lookup.appointment.service_title;

  const { error: insertError } = await supabase.from("testimonials").insert({
    customer_name,
    review,
    role,
    rating,
    is_approved: false,
    sort_order: 0,
  });

  if (insertError) {
    console.error("[submitReview] insert", insertError.message);
    return { success: false, error: "Could not save your review. Please try again." };
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      review_submitted_at: new Date().toISOString(),
      review_token: null,
    })
    .eq("id", lookup.appointment.id)
    .eq("review_token", token);

  if (updateError) {
    console.error("[submitReview] invalidate token", updateError.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/appointments");
  return { success: true };
}
