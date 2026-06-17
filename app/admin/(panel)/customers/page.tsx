import { Plus, Mail, Phone, Eye, Search } from "lucide-react";
import { customers } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader, Panel } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/Badge";

export default function CustomersPage() {
  return (
    <>
      <AdminPageHeader
        title="Customers"
        subtitle={`${customers.length} customers in your database`}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total customers", value: "1,842" },
          { label: "Repeat customers", value: "63%" },
          { label: "Avg. lifetime value", value: "$1,290" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface/70 p-5">
            <p className="font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm text-mist">{s.label}</p>
          </div>
        ))}
      </div>

      <Panel
        title="All customers"
        action={
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              placeholder="Search…"
              className="w-56 rounded-lg border border-line bg-charcoal-light py-1.5 pl-9 pr-3 text-sm text-snow placeholder:text-mist/70 focus:border-gold/50 focus:outline-none"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-mist">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Phone</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Service History</th>
                <th className="px-5 py-3.5 font-medium">Total Spent</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-xs font-bold text-ink">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-xs text-mist">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1.5 text-snow/85 hover:text-gold"
                    >
                      <Phone className="h-3.5 w-3.5 text-mist" />
                      {c.phone}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-1.5 text-snow/85 hover:text-gold"
                    >
                      <Mail className="h-3.5 w-3.5 text-mist" />
                      {c.email}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{c.visits} visits</Badge>
                      <span className="text-xs text-mist">{c.lastService}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">{c.totalSpent}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        title="View profile"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                      >
                        <Eye className="h-4 w-4" />
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
