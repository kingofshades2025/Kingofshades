import { requireAdmin } from "@/lib/auth/admin";
import { getAdminAppointments, getBlockedDates } from "@/lib/queries/admin";
import { CalendarManager } from "@/components/admin/CalendarManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminCalendarPage() {
  await requireAdmin();
  let appointments: Awaited<ReturnType<typeof getAdminAppointments>> = [];
  let blockedDates: string[] = [];
  if (isSupabaseConfigured()) {
    try {
      const [appts, blocked] = await Promise.all([getAdminAppointments(), getBlockedDates()]);
      appointments = appts;
      blockedDates = blocked.map((b) => b.blocked_date);
    } catch {
      appointments = [];
      blockedDates = [];
    }
  }
  return <CalendarManager appointments={appointments} blockedDates={blockedDates} />;
}
