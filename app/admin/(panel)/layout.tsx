import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDashboardStats } from "@/lib/queries/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let pendingCount = 0;

  if (isSupabaseConfigured()) {
    try {
      const stats = await getDashboardStats();
      pendingCount = stats.upcomingAppointments;
    } catch {
      pendingCount = 0;
    }
  }

  return <AdminShell pendingCount={pendingCount}>{children}</AdminShell>;
}
