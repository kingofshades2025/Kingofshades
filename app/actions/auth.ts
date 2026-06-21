"use server";

import { redirect } from "next/navigation";
import { APP_URL } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "This account is not authorized for admin access.",
    };
  }

  redirect("/admin");
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const origin = APP_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/admin/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/admin");
}
