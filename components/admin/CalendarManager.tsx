"use client";

import type { Appointment } from "@/lib/types/database";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10",
  confirmed: "border-emerald-500/40 bg-emerald-500/10",
  in_progress: "border-blue-500/40 bg-blue-500/10",
  completed: "border-mist/30 bg-white/5",
  cancelled: "border-red-500/30 bg-red-500/5",
};

export function CalendarManager({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  function localDateIso(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <>
      <AdminPageHeader title="Calendar" subtitle="Weekly schedule view — color-coded by status." />
      <div className="grid gap-4 lg:grid-cols-7">
        {days.map((day) => {
          const dayIso = localDateIso(day);
          const dayAppts = appointments.filter((a) => a.appointment_date === dayIso);
          return (
            <div key={dayIso} className="rounded-2xl border border-line bg-surface/70 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-mist">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p className="font-display text-lg font-bold text-white">{day.getDate()}</p>
              <div className="mt-3 space-y-2">
                {dayAppts.length === 0 ? (
                  <p className="text-xs text-mist/70">No appointments</p>
                ) : (
                  dayAppts.map((a) => (
                    <div
                      key={a.id}
                      className={cn("rounded-xl border p-2.5 text-xs", statusColors[a.status] ?? statusColors.pending)}
                    >
                      <p className="font-semibold text-white">{a.appointment_time}</p>
                      <p className="mt-1 text-snow/85">{a.customer_name}</p>
                      <p className="text-mist">{a.service_title}</p>
                      <span className="mt-2 inline-block rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-mist">
                        {a.status.replace("_", " ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
