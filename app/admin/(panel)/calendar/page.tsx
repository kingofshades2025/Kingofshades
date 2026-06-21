import { requireAdmin } from "@/lib/auth/admin";
import { getAdminAppointments } from "@/lib/queries/admin";
import { CalendarManager } from "@/components/admin/CalendarManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminCalendarPage() {
  await requireAdmin();
  let appointments: Awaited<ReturnType<typeof getAdminAppointments>> = [];
  if (isSupabaseConfigured()) {
    try {
      appointments = await getAdminAppointments();
    } catch {
      appointments = [];
    }
  }
  return <CalendarManager appointments={appointments} />;
}
