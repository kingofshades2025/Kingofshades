"use client";

import { useState, useTransition } from "react";
import type { Appointment, AppointmentStatus } from "@/lib/types/database";
import { updateAppointmentStatus } from "@/app/actions/admin";
import { AdminPageHeader, AppointmentStatusBadge } from "@/components/admin/AdminUI";
import { AppointmentQuotePanel } from "@/components/admin/AppointmentQuotePanel";
import { photoUrlsFromDetails, UploadedFilesGallery } from "@/components/ui/ClientFileUpload";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp } from "lucide-react";

const statuses: AppointmentStatus[] = [
  "requested",
  "quote_sent",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export function AppointmentsManager({ appointments }: { appointments: Appointment[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.customer_name.toLowerCase().includes(q) ||
      a.customer_email.toLowerCase().includes(q) ||
      a.service_title.toLowerCase().includes(q) ||
      (a.appointment_number ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <AdminPageHeader
        title="Appointments"
        subtitle="Review booking requests, send quotes, and manage scheduled work."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Field className="min-w-48 flex-1">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        <Field>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="space-y-4">
        {filtered.map((a) => {
          const expanded = expandedId === a.id;
          return (
            <article key={a.id} className="overflow-hidden rounded-2xl border border-line bg-surface/40">
              <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{a.customer_name}</p>
                    <AppointmentStatusBadge status={a.status} />
                    {a.quote_pdf_url && (
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold">
                        PDF quote
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-mist">{a.customer_email}</p>
                  {a.appointment_number && (
                    <p className="mt-1 font-mono text-xs text-gold/80">#{a.appointment_number}</p>
                  )}
                  <p className="mt-2 text-sm text-snow">{a.service_title}</p>
                  <p className="text-sm text-mist">
                    {a.appointment_date} · {a.appointment_time}
                  </p>
                  {photoUrlsFromDetails(a.details).length > 0 && (
                    <div className="mt-3">
                      <UploadedFilesGallery urls={photoUrlsFromDetails(a.details)} compact />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedId(expanded ? null : a.id)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Close
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Manage
                    </>
                  )}
                </Button>
              </div>

              {expanded && (
                <div className="border-t border-line p-4 sm:p-5">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <AppointmentQuotePanel appointment={a} />
                    <div>
                      <p className="mb-3 text-sm font-medium text-snow">Update status</p>
                      <div className="flex flex-wrap gap-2">
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
                            {s.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-mist">
                        Confirm only after the client approves the quote — that locks the calendar slot.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <p className="rounded-2xl border border-line px-4 py-8 text-center text-sm text-mist">
          No appointments found.
        </p>
      )}
    </>
  );
}
