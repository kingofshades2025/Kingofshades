"use client";

import { useState, useTransition } from "react";
import type { Appointment, AppointmentStatus } from "@/lib/types/database";
import { updateAppointmentStatus } from "@/app/actions/admin";
import { AdminPageHeader, AppointmentStatusBadge } from "@/components/admin/AdminUI";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const statuses: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export function AppointmentsManager({ appointments }: { appointments: Appointment[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.customer_name.toLowerCase().includes(q) ||
      a.customer_email.toLowerCase().includes(q) ||
      a.service_title.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <AdminPageHeader title="Appointments" subtitle="View and manage booking requests." />

      <div className="mb-6 flex flex-wrap gap-3">
        <Field className="min-w-48 flex-1">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        <Field>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-charcoal-light text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((a) => (
              <tr key={a.id} className="bg-surface/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{a.customer_name}</p>
                  <p className="text-xs text-mist">{a.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-mist">{a.service_title}</td>
                <td className="px-4 py-3 text-mist">
                  {a.appointment_date} · {a.appointment_time}
                </td>
                <td className="px-4 py-3">
                  <AppointmentStatusBadge status={a.status.charAt(0).toUpperCase() + a.status.slice(1) as "Pending" | "Confirmed" | "Completed" | "Cancelled"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {statuses.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={a.status === s ? "primary" : "subtle"}
                        disabled={isPending || a.status === s}
                        onClick={() =>
                          startTransition(() => {
                            void updateAppointmentStatus(a.id, s);
                          })
                        }
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="px-4 py-8 text-center text-sm text-mist">No appointments found.</p>
        )}
      </div>
    </>
  );
}
