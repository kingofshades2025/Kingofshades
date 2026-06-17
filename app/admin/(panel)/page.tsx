import Link from "next/link";
import { Download, Plus, ArrowUpRight } from "lucide-react";
import {
  adminStats,
  appointments,
  revenueByMonth,
  invoices,
} from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  AdminPageHeader,
  StatCard,
  Panel,
  AppointmentStatusBadge,
  InvoiceStatusBadge,
} from "@/components/admin/AdminUI";

export default function AdminDashboardPage() {
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.value));

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening at King of Shades today."
        actions={
          <>
            <Button variant="subtle" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" href="/admin/appointments">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {adminStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Panel
          title="Revenue overview"
          className="lg:col-span-2"
          action={<span className="text-xs text-mist">Last 6 months</span>}
        >
          <div className="p-5">
            <div className="flex items-end gap-3 sm:gap-5">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-gold-dark/40 to-gold transition-all"
                      style={{ height: `${(m.value / maxRevenue) * 100}%` }}
                      title={`$${m.value}k`}
                    />
                  </div>
                  <span className="text-xs text-mist">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="text-mist">Total (6 mo)</span>
              <span className="font-display text-lg font-bold text-white">$368,000</span>
            </div>
          </div>
        </Panel>

        {/* Quotes / quick stats */}
        <Panel title="Quote requests">
          <div className="space-y-4 p-5">
            {[
              { label: "New this week", value: "22", tone: "text-gold" },
              { label: "Awaiting response", value: "14", tone: "text-amber-400" },
              { label: "Converted", value: "31", tone: "text-emerald-400" },
            ].map((q) => (
              <div
                key={q.label}
                className="flex items-center justify-between rounded-xl border border-line bg-charcoal-light px-4 py-3"
              >
                <span className="text-sm text-mist">{q.label}</span>
                <span className={`font-display text-lg font-bold ${q.tone}`}>
                  {q.value}
                </span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              View all quotes
            </Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <Panel
          title="Upcoming appointments"
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-line">
            {appointments
              .filter((a) => a.status === "Confirmed" || a.status === "Pending")
              .slice(0, 5)
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 font-display text-sm font-bold text-gold">
                    {a.customer.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {a.customer}
                    </p>
                    <p className="truncate text-xs text-mist">{a.service}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm text-snow">{a.date}</p>
                    <p className="text-xs text-mist">{a.time}</p>
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </div>
              ))}
          </div>
        </Panel>

        {/* Recent payments */}
        <Panel
          title="Recent payments"
          action={
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-line">
            {invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {inv.customer}
                  </p>
                  <p className="text-xs text-mist">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{inv.amount}</p>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
