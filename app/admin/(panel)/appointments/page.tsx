import type { Appointment, Service } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminAppointments, getAdminServices } from "@/lib/queries/admin";
import { getSiteSettings } from "@/lib/queries/public";
import { getOperationalSettings } from "@/lib/booking/settings";
import { AppointmentsManager } from "@/components/admin/AppointmentsManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminAppointmentsPage() {
  await requireAdmin();

  let appointments: Appointment[] = [];
  let services: Service[] = [];
  let defaultDurationMinutes = 120;

  if (isSupabaseConfigured()) {
    try {
      const [appts, svcList, settings] = await Promise.all([
        getAdminAppointments(),
        getAdminServices(),
        getSiteSettings(),
      ]);
      appointments = appts;
      services = svcList;
      defaultDurationMinutes = getOperationalSettings(settings).booking.slotDurationMinutes;
    } catch {
      appointments = [];
    }
  }

  return (
    <AppointmentsManager
      appointments={appointments}
      services={services}
      defaultDurationMinutes={defaultDurationMinutes}
    />
  );
}
