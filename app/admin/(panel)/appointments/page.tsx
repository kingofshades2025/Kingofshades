import { Plus, Eye, Pencil, X, Filter, Download } from "lucide-react";
import { appointments } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  AdminPageHeader,
  AppointmentStatusBadge,
  Panel,
} from "@/components/admin/AdminUI";

const tabs = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

export default function AppointmentsPage() {
  return (
    <>
      <AdminPageHeader
        title="Appointments"
        subtitle={`${appointments.length} total bookings`}
        actions={
          <>
            <Button variant="subtle" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </>
        }
      />

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              i === 0
                ? "rounded-full border border-gold/50 bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold"
                : "rounded-full border border-line bg-charcoal-light px-4 py-1.5 text-sm font-medium text-snow/75 hover:text-white"
            }
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-charcoal-light px-4 py-1.5 text-sm font-medium text-snow/75 hover:text-white"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-mist">
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Service Type</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Time</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {appointments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                        {a.customer.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="font-medium text-white">{a.customer}</p>
                        <p className="text-xs text-mist">{a.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-snow/85">{a.service}</td>
                  <td className="px-5 py-4 text-snow/85">{a.date}</td>
                  <td className="px-5 py-4 text-snow/85">{a.time}</td>
                  <td className="px-5 py-4">
                    <AppointmentStatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="View"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-gold/40 hover:text-gold"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Cancel"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-snow/70 hover:border-red-500/40 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm text-mist">
          <span>Showing {appointments.length} of {appointments.length}</span>
          <div className="flex gap-1.5">
            <button className="rounded-lg border border-line px-3 py-1.5 text-xs hover:text-white" disabled>
              Previous
            </button>
            <button className="rounded-lg border border-line px-3 py-1.5 text-xs hover:text-white">
              Next
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
