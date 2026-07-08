"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Appointment, AppointmentStatus } from "@/lib/types/database";
import {
  cancelAppointment,
  rescheduleAppointment,
  updateAppointment,
  updateAppointmentStatus,
} from "@/app/actions/admin";
import { getAvailableTimeSlots } from "@/app/actions/availability";
import { AppointmentQuotePanel } from "@/components/admin/AppointmentQuotePanel";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { AppointmentStatusBadge } from "@/components/admin/AdminUI";
import { VehicleFields } from "@/components/booking/VehicleFields";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { formatMoney } from "@/lib/booking/pricing";

const statuses: AppointmentStatus[] = [
  "requested",
  "quote_sent",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

function detailValue(details: Record<string, string | string[]>, key: string) {
  const v = details[key];
  return typeof v === "string" ? v : "";
}

export function AppointmentDetailPanel({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const [statusPending, startStatusTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  const [rescheduleDate, setRescheduleDate] = useState(appointment.appointment_date);
  const [rescheduleTime, setRescheduleTime] = useState(appointment.appointment_time);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const details = appointment.details ?? {};

  const [vehicleYear, setVehicleYear] = useState(detailValue(details, "Year"));
  const [vehicleMake, setVehicleMake] = useState(detailValue(details, "Vehicle make"));
  const [vehicleModel, setVehicleModel] = useState(detailValue(details, "Vehicle model"));

  const editAction = useAdminAction(updateAppointment, {
    successMessage: "Appointment updated.",
    onSuccess: refresh,
  });

  const rescheduleAction = useAdminAction(rescheduleAppointment, {
    successMessage: "Appointment rescheduled.",
    onSuccess: refresh,
  });

  const cancelAction = useAdminAction(cancelAppointment, {
    successMessage: "Appointment cancelled.",
    onSuccess: () => {
      setShowCancel(false);
      setCancelReason("");
      refresh();
    },
  });

  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    void getAvailableTimeSlots(rescheduleDate).then((result) => {
      if (cancelled) return;
      const slots = result.slots;
      setTimeSlots(slots);
      if (!slots.includes(rescheduleTime) && slots.length > 0) {
        setRescheduleTime(slots[0]);
      }
      setSlotsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [rescheduleDate, rescheduleTime]);

  const handleStatusChange = (status: AppointmentStatus) => {
    setStatusError(null);
    startStatusTransition(() => {
      void updateAppointmentStatus(appointment.id, status).then((result) => {
        if (result.success) {
          refresh();
        } else {
          setStatusError(result.error);
        }
      });
    });
  };

  const isCancelled = appointment.status === "cancelled";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <AppointmentStatusBadge status={appointment.status} />
        {appointment.payment_status !== "unpaid" && (
          <span className="rounded-full border border-line px-2.5 py-0.5 text-xs capitalize text-mist">
            {appointment.payment_status.replace("_", " ")}
          </span>
        )}
        {appointment.total_cents != null && appointment.total_cents > 0 && (
          <span className="text-sm text-mist">Est. {formatMoney(appointment.total_cents)}</span>
        )}
      </div>

      <AdminFeedback message={editAction.message} error={editAction.error} />
      <AdminFeedback message={rescheduleAction.message} error={rescheduleAction.error} />
      <AdminFeedback message={cancelAction.message} error={cancelAction.error} />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-line bg-charcoal-light/30 p-5">
          <div>
            <h4 className="font-display text-base font-semibold text-white">Edit details</h4>
            <p className="mt-1 text-sm text-mist">Update contact info, notes, and vehicle details.</p>
          </div>

          <form action={editAction.run} className="space-y-4">
            <input type="hidden" name="id" value={appointment.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer name" className="sm:col-span-2">
                <Input name="customer_name" defaultValue={appointment.customer_name} required />
              </Field>
              <Field label="Email">
                <Input name="customer_email" type="email" defaultValue={appointment.customer_email} required />
              </Field>
              <Field label="Phone">
                <Input name="customer_phone" type="tel" defaultValue={appointment.customer_phone ?? ""} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input name="customer_address" defaultValue={appointment.customer_address ?? ""} />
              </Field>
              <Field label="Service" className="sm:col-span-2">
                <Input name="service_title" defaultValue={appointment.service_title} />
              </Field>
              <Field label="Duration (minutes)">
                <Input
                  name="duration_minutes"
                  type="number"
                  min="30"
                  step="15"
                  defaultValue={appointment.duration_minutes ?? 120}
                />
              </Field>
            </div>

            <VehicleFields
              year={vehicleYear}
              make={vehicleMake}
              model={vehicleModel}
              onYearChange={setVehicleYear}
              onMakeChange={setVehicleMake}
              onModelChange={setVehicleModel}
            />
            <input type="hidden" name="detail_Year" value={vehicleYear} />
            <input type="hidden" name="detail_Vehicle make" value={vehicleMake === "__other__" ? "" : vehicleMake} />
            <input type="hidden" name="detail_Vehicle model" value={vehicleModel === "__other__" ? "" : vehicleModel} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tint percentage">
                <Input
                  name="detail_Tint percentage"
                  defaultValue={detailValue(details, "Tint percentage")}
                />
              </Field>
              <Field label="Tint type">
                <Input name="detail_Tint type" defaultValue={detailValue(details, "Tint type")} />
              </Field>
            </div>

            <Field label="Customer notes">
              <Textarea name="notes" rows={2} defaultValue={appointment.notes ?? ""} />
            </Field>
            <Field label="Internal notes (staff only)">
              <Textarea name="internal_notes" rows={2} defaultValue={appointment.internal_notes ?? ""} />
            </Field>

            <Button type="submit" size="sm" disabled={editAction.isPending || isCancelled}>
              {editAction.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-line bg-charcoal-light/30 p-5">
            <div>
              <h4 className="font-display text-base font-semibold text-white">Reschedule</h4>
              <p className="mt-1 text-sm text-mist">
                Requested and quoted bookings can move freely. Confirmed slots check availability.
              </p>
            </div>

            <form action={rescheduleAction.run} className="space-y-4">
              <input type="hidden" name="id" value={appointment.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <Input
                    name="appointment_date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Time">
                  {slotsLoading ? (
                    <Input disabled placeholder="Loading slots…" />
                  ) : timeSlots.length > 0 ? (
                    <Select
                      name="appointment_time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      required
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      name="appointment_time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      required
                    />
                  )}
                </Field>
              </div>
              <Button type="submit" size="sm" variant="outline" disabled={rescheduleAction.isPending || isCancelled}>
                {rescheduleAction.isPending ? "Rescheduling…" : "Reschedule"}
              </Button>
            </form>
          </section>

          <AppointmentQuotePanel appointment={appointment} />
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-charcoal-light/30 p-5">
        <h4 className="font-display text-base font-semibold text-white">Status</h4>
        <p className="mt-1 text-sm text-mist">
          Confirm only after the client approves the quote — that locks the calendar slot.
        </p>
        {statusError && <p className="mt-2 text-sm text-red-400">{statusError}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={appointment.status === s ? "primary" : "subtle"}
              disabled={statusPending || appointment.status === s || isCancelled}
              onClick={() => handleStatusChange(s)}
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>

        {!isCancelled && (
          <div className="mt-6 border-t border-line pt-4">
            {!showCancel ? (
              <Button size="sm" variant="subtle" onClick={() => setShowCancel(true)}>
                Cancel appointment…
              </Button>
            ) : (
              <form action={cancelAction.run} className="space-y-3">
                <input type="hidden" name="id" value={appointment.id} />
                <Field label="Cancellation reason (optional)">
                  <Textarea
                    name="cancellation_reason"
                    rows={2}
                    placeholder="Customer requested reschedule, no-show policy…"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="outline" disabled={cancelAction.isPending}>
                    {cancelAction.isPending ? "Cancelling…" : "Confirm cancellation"}
                  </Button>
                  <Button type="button" size="sm" variant="subtle" onClick={() => setShowCancel(false)}>
                    Keep appointment
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
