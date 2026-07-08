"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
} from "lucide-react";
import type { Appointment } from "@/lib/types/database";
import { AdminPageHeader, AppointmentStatusBadge } from "@/components/admin/AdminUI";
import { formatMoney } from "@/lib/booking/pricing";
import { toDateIso } from "@/lib/booking/availability";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { photoUrlsFromDetails, UploadedFilesGallery } from "@/components/ui/ClientFileUpload";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusDot: Record<string, string> = {
  requested: "bg-amber-400",
  quote_sent: "bg-gold",
  confirmed: "bg-emerald-400",
  in_progress: "bg-blue-400",
  completed: "bg-mist",
  cancelled: "bg-red-400",
};

const statusCard: Record<string, string> = {
  requested: "border-amber-500/40 bg-amber-500/10",
  quote_sent: "border-gold/40 bg-gold/10",
  confirmed: "border-emerald-500/40 bg-emerald-500/10",
  in_progress: "border-blue-500/40 bg-blue-500/10",
  completed: "border-mist/30 bg-white/5",
  cancelled: "border-red-500/30 bg-red-500/5",
};

function localDateIso(d: Date) {
  return toDateIso(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDayLabel(iso: string) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(appointments: Appointment[]) {
  const map = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const list = map.get(a.appointment_date) ?? [];
    list.push(a);
    map.set(a.appointment_date, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }
  return map;
}

export function CalendarManager({ appointments }: { appointments: Appointment[] }) {
  const now = new Date();
  const todayIso = localDateIso(now);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const dayPanelRef = useRef<HTMLDivElement>(null);

  const byDate = useMemo(() => groupByDate(appointments), [appointments]);

  useEffect(() => {
    if (!selectedIso || !dayPanelRef.current) return;
    dayPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIso]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedAppointments = selectedIso ? (byDate.get(selectedIso) ?? []) : [];

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function selectDate(iso: string) {
    setSelectedIso(iso);
    setDetailAppt(null);
  }

  function openAppointment(iso: string, appt: Appointment) {
    setSelectedIso(iso);
    setDetailAppt(appt);
  }

  function goToToday() {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedIso(todayIso);
    setDetailAppt(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Calendar"
        subtitle="Click a date to view bookings, then click a booking for full details."
        actions={
          <Button variant="subtle" size="sm" onClick={goToToday}>
            Today
          </Button>
        }
      />

      <div className="rounded-2xl border border-line bg-surface/70 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist transition-colors hover:border-gold/40 hover:text-gold"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-lg font-semibold text-white sm:text-xl">{monthLabel}</h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist transition-colors hover:border-gold/40 hover:text-gold"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wider text-mist">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[5.5rem] rounded-xl bg-charcoal-light/30 sm:min-h-[6.5rem]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const iso = toDateIso(viewYear, viewMonth, day);
            const dayAppts = byDate.get(iso) ?? [];
            const isToday = iso === todayIso;
            const isSelected = selectedIso === iso;
            const preview = dayAppts.slice(0, 2);
            const overflow = dayAppts.length - preview.length;

            return (
              <div
                key={iso}
                role="button"
                tabIndex={0}
                onClick={() => selectDate(iso)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectDate(iso);
                  }
                }}
                className={cn(
                  "group flex min-h-[5.5rem] cursor-pointer flex-col rounded-xl border p-1.5 text-left transition-all sm:min-h-[6.5rem] sm:p-2",
                  isSelected
                    ? "border-gold/60 bg-gold/10 ring-1 ring-gold/30"
                    : "border-line/80 bg-charcoal-light/40 hover:border-gold/30 hover:bg-charcoal-light/70",
                  isToday && !isSelected && "ring-1 ring-gold/25",
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:text-sm",
                    isToday ? "bg-gold text-ink" : "text-snow group-hover:text-gold",
                    isSelected && !isToday && "text-gold",
                  )}
                >
                  {day}
                </span>

                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  {preview.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAppointment(iso, a);
                      }}
                      className={cn(
                        "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight text-snow/90 transition-colors hover:ring-1 hover:ring-gold/40 sm:text-[11px]",
                        statusCard[a.status] ?? statusCard.requested,
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[a.status] ?? statusDot.requested)}
                      />
                      <span className="truncate">{a.appointment_time}</span>
                    </button>
                  ))}
                  {overflow > 0 && (
                    <span className="px-1 text-[10px] font-medium text-gold">+{overflow} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4 text-xs text-mist">
          {Object.entries(statusDot).map(([status, color]) => (
            <span key={status} className="inline-flex items-center gap-1.5 capitalize">
              <span className={cn("h-2 w-2 rounded-full", color)} />
              {status.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {selectedIso && (
        <div
          ref={dayPanelRef}
          className="mt-6 scroll-mt-24 rounded-2xl border border-line bg-surface/70 p-4 sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">{formatDayLabel(selectedIso)}</h3>
              <p className="mt-0.5 text-sm text-mist">
                {selectedAppointments.length === 0
                  ? "No bookings scheduled"
                  : `${selectedAppointments.length} booking${selectedAppointments.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIso(null)}
              className="rounded-lg border border-line p-1.5 text-mist hover:text-gold"
              aria-label="Close day view"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedAppointments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-mist">
              Nothing on the schedule for this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedAppointments.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setDetailAppt(a)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:border-gold/40",
                    statusCard[a.status] ?? statusCard.requested,
                    detailAppt?.id === a.id && "border-gold/50 ring-1 ring-gold/30",
                  )}
                >
                  <div className="min-w-[4.5rem] text-center">
                    <p className="font-display text-sm font-bold text-white">{a.appointment_time}</p>
                    {a.duration_minutes && (
                      <p className="text-[10px] text-mist">{a.duration_minutes} min</p>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{a.customer_name}</p>
                    <p className="truncate text-sm text-snow/80">{a.service_title}</p>
                    {a.appointment_number && (
                      <p className="mt-0.5 font-mono text-xs text-gold">#{a.appointment_number}</p>
                    )}
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {detailAppt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="appt-detail-title"
          onClick={() => setDetailAppt(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-charcoal shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h3 id="appt-detail-title" className="font-display text-lg font-semibold text-white">
                  Booking details
                </h3>
                {detailAppt.appointment_number && (
                  <p className="mt-0.5 font-mono text-sm text-gold">#{detailAppt.appointment_number}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailAppt(null)}
                className="rounded-lg border border-line p-1.5 text-mist hover:text-gold"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <AppointmentStatusBadge status={detailAppt.status} />
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs capitalize text-mist">
                  {detailAppt.payment_status.replace("_", " ")}
                </span>
              </div>

              <DetailRow icon={Clock} label="When">
                {formatDayLabel(detailAppt.appointment_date)} at {detailAppt.appointment_time}
              </DetailRow>

              <DetailRow icon={User} label="Customer">
                {detailAppt.customer_name}
              </DetailRow>

              <DetailRow icon={Mail} label="Email">
                <a href={`mailto:${detailAppt.customer_email}`} className="text-gold hover:underline">
                  {detailAppt.customer_email}
                </a>
              </DetailRow>

              {detailAppt.customer_phone && (
                <DetailRow icon={Phone} label="Phone">
                  <a href={`tel:${detailAppt.customer_phone}`} className="text-gold hover:underline">
                    {detailAppt.customer_phone}
                  </a>
                </DetailRow>
              )}

              {(detailAppt.customer_address || detailAppt.notes) && (
                <DetailRow icon={MapPin} label="Address / notes">
                  {detailAppt.customer_address}
                  {detailAppt.customer_address && detailAppt.notes && <br />}
                  {detailAppt.notes}
                </DetailRow>
              )}

              <DetailRow icon={FileText} label="Service">
                {detailAppt.service_title}
              </DetailRow>

              {detailAppt.total_cents != null && (
                <DetailRow icon={CreditCard} label="Payment">
                  Total {formatMoney(detailAppt.total_cents)}
                  {detailAppt.amount_paid_cents != null && (
                    <> · Paid {formatMoney(detailAppt.amount_paid_cents)}</>
                  )}
                  {detailAppt.deposit_cents != null && (
                    <> · Deposit {formatMoney(detailAppt.deposit_cents)}</>
                  )}
                </DetailRow>
              )}

              {detailAppt.internal_notes && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-200/80">Internal notes</p>
                  <p className="mt-1 text-sm text-snow/90">{detailAppt.internal_notes}</p>
                </div>
              )}

              {detailAppt.details && Object.keys(detailAppt.details).length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mist">Service details</p>
                  <dl className="space-y-2 rounded-xl border border-line bg-charcoal-light/50 p-3 text-sm">
                    {Object.entries(detailAppt.details)
                      .filter(([key]) => key !== "photo_urls")
                      .map(([key, value]) =>
                      typeof value === "string" && value ? (
                        <div key={key} className="flex justify-between gap-4">
                          <dt className="text-mist">{key}</dt>
                          <dd className="text-right text-snow">{value}</dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                </div>
              )}

              {photoUrlsFromDetails(detailAppt.details).length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mist">Reference files</p>
                  <UploadedFilesGallery urls={photoUrlsFromDetails(detailAppt.details)} />
                </div>
              )}

              {detailAppt.quote_pdf_url && (
                <DetailRow icon={FileText} label="Quote PDF">
                  <a
                    href={detailAppt.quote_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    View quote PDF
                    {detailAppt.quote_amount_cents != null && (
                      <> ({formatMoney(detailAppt.quote_amount_cents)})</>
                    )}
                  </a>
                </DetailRow>
              )}

              <div className="flex gap-2 pt-2">
                <Button href="/admin/appointments" variant="outline" size="sm" className="flex-1">
                  Manage in appointments
                </Button>
                <Button variant="subtle" size="sm" onClick={() => setDetailAppt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-charcoal-light text-gold">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-mist">{label}</p>
        <p className="mt-0.5 text-sm text-snow">{children}</p>
      </div>
    </div>
  );
}
