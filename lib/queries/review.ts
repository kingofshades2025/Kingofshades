import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ReviewAppointment = {
  id: string;
  customer_name: string;
  service_title: string;
  appointment_number: string | null;
};

export type ReviewLookupResult =
  | { ok: true; appointment: ReviewAppointment }
  | { ok: false; reason: "invalid" | "submitted" | "not_completed" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAppointmentForReview(token: string): Promise<ReviewLookupResult> {
  if (!token || !UUID_RE.test(token) || !isSupabaseConfigured()) {
    return { ok: false, reason: "invalid" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, service_title, appointment_number, status, review_submitted_at, review_token",
    )
    .eq("review_token", token)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "invalid" };
  }

  if (data.status !== "completed") {
    return { ok: false, reason: "not_completed" };
  }

  if (data.review_submitted_at) {
    return { ok: false, reason: "submitted" };
  }

  return {
    ok: true,
    appointment: {
      id: data.id,
      customer_name: data.customer_name,
      service_title: data.service_title,
      appointment_number: data.appointment_number,
    },
  };
}
