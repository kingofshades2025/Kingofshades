import type { Appointment } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminAppointments } from "@/lib/queries/admin";
import { AppointmentsManager } from "@/components/admin/AppointmentsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminAppointmentsPage() {
  await requireAdmin();

  let appointments: Appointment[] = [];
  if (isSupabaseConfigured()) {
    try {
      appointments = await getAdminAppointments();
    } catch {
      appointments = [];
    }
  }

  return <AppointmentsManager appointments={appointments} />;
}
