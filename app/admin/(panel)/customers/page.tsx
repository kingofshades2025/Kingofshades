import type { Customer } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCustomers } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminCustomersPage() {
  await requireAdmin();

  let customers: Customer[] = [];
  if (isSupabaseConfigured()) {
    try {
      customers = await getAdminCustomers();
    } catch {
      customers = [];
    }
  }

  return (
    <>
      <AdminPageHeader title="Customers" subtitle="Customer records from bookings and contact forms." />
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-charcoal-light text-mist">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr key={c.id} className="bg-surface/40">
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3 text-mist">{c.email}</td>
                <td className="px-4 py-3 text-mist">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-mist">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && (
          <p className="px-4 py-8 text-center text-sm text-mist">No customers yet.</p>
        )}
      </div>
    </>
  );
}
