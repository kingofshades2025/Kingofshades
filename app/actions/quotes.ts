"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSiteBaseUrl } from "@/lib/app-url";
import { sendEmail, getEmailTo, quoteNotificationHtml } from "@/lib/email";
import { filesFromFormData, uploadClientFiles } from "@/lib/uploads/storage";

export type QuoteResult =
  | { success: true }
  | { success: false; error: string };

export async function submitQuoteRequest(formData: FormData): Promise<QuoteResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const serviceType = (formData.get("service_type") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const measurements = (formData.get("measurements") as string)?.trim() || null;

  if (!name || !email || !serviceType || !description) {
    return { success: false, error: "Name, email, service, and description are required." };
  }

  const pendingFiles = filesFromFormData(formData);

  function parsePreUploadedUrls(): string[] {
    const raw = (formData.get("photo_urls") as string | null)?.trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((u): u is string => typeof u === "string" && u.length > 0);
    } catch {
      return [];
    }
  }

  try {
    if (isSupabaseConfigured()) {
      const admin = createAdminClient();

      let photoUrls = parsePreUploadedUrls();
      if (pendingFiles.length > 0) {
        const upload = await uploadClientFiles(pendingFiles, "quotes");
        if (!upload.success) return upload;
        photoUrls = [...photoUrls, ...upload.urls];
      }
      if (photoUrls.length > 5) {
        return { success: false, error: "You can upload up to 5 files." };
      }

      let customerId: string | null = null;
      const { data: customerIdResult } = await admin.rpc("upsert_booking_customer", {
        p_name: name,
        p_email: email,
        p_phone: phone,
        p_address: null,
      });
      customerId = customerIdResult ?? null;

      const { data: inserted, error } = await admin
        .from("quote_requests")
        .insert({
          customer_id: customerId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          service_type: serviceType,
          description,
          measurements,
          photo_urls: photoUrls,
          status: "new",
        })
        .select("id")
        .single();

      if (error) {
        console.error("[quote]", error.message);
        return { success: false, error: "Could not submit quote request." };
      }

      const quoteId = inserted?.id;
      await sendEmail({
        to: getEmailTo(),
        subject: `New quote request: ${name} — ${serviceType}`,
        html: quoteNotificationHtml({
          name,
          email,
          phone: phone ?? "",
          serviceType,
          description,
          measurements: measurements ?? "",
          photoUrls,
          adminQuoteUrl: quoteId
            ? `${getSiteBaseUrl()}/admin/quotes?id=${quoteId}`
            : undefined,
        }),
        replyTo: email,
      });

      revalidatePath("/admin/quotes");
      return { success: true };
    }

    await sendEmail({
      to: getEmailTo(),
      subject: `New quote request: ${name} — ${serviceType}`,
      html: quoteNotificationHtml({
        name,
        email,
        phone: phone ?? "",
        serviceType,
        description,
        measurements: measurements ?? "",
        photoUrls: [],
      }),
      replyTo: email,
    });

    revalidatePath("/admin/quotes");
    return { success: true };
  } catch (err) {
    console.error("[submitQuoteRequest]", err);
    return { success: false, error: "Could not submit quote request. Please try again." };
  }
}
