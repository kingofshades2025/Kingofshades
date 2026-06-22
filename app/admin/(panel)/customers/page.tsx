import type { Customer } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCustomers, getCustomerAppointmentCounts } from "@/lib/queries/admin";
import { CustomersManager } from "@/components/admin/CustomersManager";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminCustomersPage() {
  await requireAdmin();

  let customers: Customer[] = [];
  let appointmentCounts: Record<string, number> = {};
  let loadError: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      [customers, appointmentCounts] = await Promise.all([
        getAdminCustomers(),
        getCustomerAppointmentCounts(),
      ]);
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : "Could not load customers from the database.";
    }
  }

  return (
    <CustomersManager
      customers={customers}
      appointmentCounts={appointmentCounts}
      loadError={loadError}
    />
  );
}
