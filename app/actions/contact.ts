"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  sendEmail,
  getEmailTo,
  contactNotificationHtml,
  contactConfirmationHtml,
} from "@/lib/email";

export type ContactResult =
  | { success: true; warning?: string }
  | { success: false; error: string };

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const service = (formData.get("service") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { success: false, error: "Name, email, and message are required." };
  }

  const payload = { name, email, phone, service, message };
  let savedToDb = false;

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        phone: phone || null,
        service: service || null,
        message,
      });
      if (error) {
        console.error("[contact] db insert", error.message);
      } else {
        savedToDb = true;
      }
    }

    try {
      await sendEmail({
        to: getEmailTo(),
        subject: `New contact: ${name}`,
        html: contactNotificationHtml(payload),
        replyTo: email,
      });

      await sendEmail({
        to: email,
        subject: "We received your message — King of Shades",
        html: contactConfirmationHtml(name),
      });
    } catch (emailErr) {
      console.error("[contact] email", emailErr);
      if (savedToDb) {
        return {
          success: true,
          warning: "Message received — we'll follow up soon. (Confirmation email could not be sent.)",
        };
      }
      throw emailErr;
    }

    return { success: true };
  } catch (err) {
    console.error("[contact]", err);
    return {
      success: false,
      error: "Could not send your message. Please try again or call us directly.",
    };
  }
}
