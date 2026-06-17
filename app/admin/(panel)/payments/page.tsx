import { Download, FileText, Eye, ArrowUpRight } from "lucide-react";
import { invoices, revenueByMonth } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  AdminPageHeader,
  Panel,
  InvoiceStatusBadge,
} from "@/components/admin/AdminUI";

export default function PaymentsPage() {
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.value));

  return (
    <>
      <AdminPageHeader
        title="Payments & Invoices"
        subtitle="Track revenue, payment history, and invoices."
        actions={
          <Button variant="subtle" size="sm">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Revenue summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue (30d)", value: "$84,920", sub: "+8.1% vs last month" },
          { label: "Outstanding", value: "$12,350", sub: "4 unpaid invoices" },
          { label: "Refunded (30d)", value: "$180", sub: "1 refund" },
          { label: "Avg. invoice", value: "$642", sub: "+3.4%" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface/70 p-5">
            <p className="text-sm text-mist">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-emerald-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Panel title="Revenue summary" className="lg:col-span-2">
          <div className="p-5">
            <div className="flex items-end gap-3 sm:gap-5">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-gold-dark/40 to-gold"
                      style={{ height: `${(m.value / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-mist">{m.month}</span>
                  <span className="text-xs font-medium text-snow/70">${m.value}k</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Payment methods */}
        <Panel title="Payment methods">
          <div className="space-y-3 p-5">
            {[
              { label: "Credit / Debit", pct: 64 },
              { label: "Apple / Google Pay", pct: 21 },
              { label: "ACH Transfer", pct: 10 },
              { label: "Other", pct: 5 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-snow/85">{m.label}</span>
                  <span className="text-mist">{m.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-charcoal-light">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Invoice list */}
      <Panel
        title="Invoices & payment history"
        className="mt-6"
        action={
          <button className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-mist">
                <th className="px-5 py-3.5 font-medium">Invoice</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Method</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-medium text-white">
                      <FileText className="h-4 w-4 text-gold" />
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-snow/85">{inv.customer}</td>
                  <td className="px-5 py-4 text-snow/85">{inv.date}</td>
                  <td className="px-5 py-4 text-mist">{inv.method}</td>
                  <td className="px-5 py-4 font-semibold text-white">{inv.amount}</td>
                  <td className="px-5 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="View invoice"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
