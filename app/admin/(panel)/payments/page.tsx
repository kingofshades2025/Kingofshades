import { requireAdmin } from "@/lib/auth/admin";
import { getAdminPayments, getPaymentSummary } from "@/lib/queries/admin";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader, Panel } from "@/components/admin/AdminUI";
import { formatMoney } from "@/lib/booking/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isStripeConfigured } from "@/lib/stripe";

export default async function PaymentsPage() {
  await requireAdmin();

  let payments: Awaited<ReturnType<typeof getAdminPayments>> = [];
  let summary = { revenueCents: 0, refundedCents: 0, transactionCount: 0, pendingCount: 0 };
  let loadError: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      [payments, summary] = await Promise.all([getAdminPayments(), getPaymentSummary()]);
    } catch (err) {
      console.error("[payments page]", err);
      loadError = "Could not load payment data. Check that migration 004 is applied and the service role key is set.";
    }
  } else {
    loadError = "Database is not configured.";
  }

  return (
    <>
      <AdminPageHeader
        title="Payments & Invoices"
        subtitle={isStripeConfigured() ? "Live Stripe transactions from your database." : "Connect Stripe keys to enable online payments."}
      />

      {loadError && <AdminFeedback error={loadError} className="mb-4" />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue (30d)", value: formatMoney(summary.revenueCents) },
          { label: "Transactions", value: String(summary.transactionCount) },
          { label: "Pending", value: String(summary.pendingCount) },
          { label: "Refunded (30d)", value: formatMoney(summary.refundedCents) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface/70 p-5">
            <p className="text-sm text-mist">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <Panel title="Payment history" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-mist">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Appointment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-mist">No payments recorded yet.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-snow/85">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 capitalize text-snow/85">{p.payment_type}</td>
                    <td className="px-5 py-4 font-semibold text-white">{formatMoney(p.amount_cents)}</td>
                    <td className="px-5 py-4 capitalize text-snow/85">{p.status}</td>
                    <td className="px-5 py-4 text-mist font-mono text-xs">{p.appointment_id?.slice(0, 8) ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
