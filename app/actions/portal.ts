"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthCallbackUrl } from "@/lib/app-url";

export async function sendPortalMagicLink(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { success: false as const, error: "Email is required." };

  if (!isSupabaseConfigured()) {
    return { success: false as const, error: "Portal is not configured." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: getAuthCallbackUrl("/portal") },
  });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function linkPortalCustomer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { linked: false };

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("customers")
      .update({ auth_user_id: user.id })
      .ilike("email", user.email);

    if (error) {
      console.error("[portal] link customer", error.message);
      return { linked: false, error: error.message };
    }
    return { linked: true };
  } catch (err) {
    console.error("[portal] link customer", err);
    return { linked: false };
  }
}

export async function signOutPortal() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}
