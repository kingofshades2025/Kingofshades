"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { AppointmentStatus, Service } from "@/lib/types/database";
import { createManualAppointment } from "@/app/actions/admin";
import { getAvailableTimeSlots } from "@/app/actions/availability";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { VehicleFields } from "@/components/booking/VehicleFields";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export function ManualAppointmentForm({
  services,
  defaultDurationMinutes = 120,
}: {
  services: Service[];
  defaultDurationMinutes?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dateIso, setDateIso] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const { run, isPending, message, error, clearFeedback } = useAdminAction(createManualAppointment, {
    successMessage: "Appointment created.",
    onSuccess: () => {
      setOpen(false);
      setDateIso("");
      setTime("");
      setVehicleYear("");
      setVehicleMake("");
      setVehicleModel("");
      router.refresh();
    },
  });

  useEffect(() => {
    if (!dateIso) {
      setTimeSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    void getAvailableTimeSlots(dateIso).then((result) => {
      if (cancelled) return;
      setTimeSlots(result.slots);
      if (result.slots.length > 0 && !result.slots.includes(time)) {
        setTime(result.slots[0]);
      }
      setSlotsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dateIso, time]);

  const activeServices = services.filter((s) => s.is_active);

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => {
          clearFeedback();
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        New appointment
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-charcoal shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Create appointment</h3>
                <p className="mt-0.5 text-sm text-mist">For phone or walk-in customers.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line p-1.5 text-mist hover:text-gold"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={run} className="space-y-4 p-5">
              <AdminFeedback message={message} error={error} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer name" className="sm:col-span-2">
                  <Input name="customer_name" required />
                </Field>
                <Field label="Email">
                  <Input name="customer_email" type="email" required />
                </Field>
                <Field label="Phone">
                  <Input name="customer_phone" type="tel" />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <Input name="customer_address" />
                </Field>
              </div>

              <Field label="Service">
                <Select name="service_title" required defaultValue="">
                  <option value="" disabled>
                    Select service…
                  </option>
                  {activeServices.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Custom Quote">Custom Quote</option>
                </Select>
              </Field>
              <input type="hidden" name="service_id" value="" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <Input
                    name="appointment_date"
                    type="date"
                    value={dateIso}
                    onChange={(e) => setDateIso(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Time">
                  {slotsLoading ? (
                    <Input disabled placeholder="Loading…" />
                  ) : timeSlots.length > 0 ? (
                    <Select name="appointment_time" value={time} onChange={(e) => setTime(e.target.value)} required>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      name="appointment_time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      required
                    />
                  )}
                </Field>
                <Field label="Duration (minutes)">
                  <Input
                    name="duration_minutes"
                    type="number"
                    min="30"
                    step="15"
                    defaultValue={defaultDurationMinutes}
                  />
                </Field>
                <Field label="Initial status">
                  <Select name="status" defaultValue="requested">
                    {(["requested", "quote_sent", "confirmed"] as AppointmentStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
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

              <Field label="Customer notes">
                <Textarea name="notes" rows={2} />
              </Field>
              <Field label="Internal notes">
                <Textarea name="internal_notes" rows={2} placeholder="Walk-in, referred by…" />
              </Field>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm text-snow">
                <input type="checkbox" name="skip_availability" value="true" className="accent-gold" />
                Override availability (force book slot)
              </label>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating…" : "Create appointment"}
                </Button>
                <Button type="button" variant="subtle" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
