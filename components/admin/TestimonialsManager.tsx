"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types/database";
import { deleteTestimonial, upsertTestimonial } from "@/app/actions/admin";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { run, isPending, message, error } = useAdminAction(upsertTestimonial, {
    successMessage: "Testimonial added.",
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setDeleteError(null);
    const result = await deleteTestimonial(id);
    if (!result.success) setDeleteError(result.error);
  };

  return (
    <>
      <AdminPageHeader title="Testimonials" subtitle="Only approved reviews appear on the homepage." />

      <AdminFeedback message={message} error={error ?? deleteError} className="mb-4" />

      <form
        action={run}
        className="mb-6 grid gap-4 rounded-2xl border border-line bg-surface/70 p-6 sm:grid-cols-2"
      >
        <Field label="Customer name"><Input name="customer_name" required /></Field>
        <Field label="Role"><Input name="role" placeholder="Tesla Model 3 Owner" /></Field>
        <Field label="Rating">
          <Select name="rating" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </Select>
        </Field>
        <Field label="Approved">
          <Select name="is_approved" defaultValue="true">
            <option value="true">Approved</option>
            <option value="false">Hidden</option>
          </Select>
        </Field>
        <Field label="Review" className="sm:col-span-2"><Textarea name="review" required /></Field>
        <div className="sm:col-span-2"><Button type="submit" disabled={isPending}>Add testimonial</Button></div>
      </form>

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line bg-surface/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{t.customer_name}</p>
                <p className="text-xs text-mist">{t.role} · {t.rating}★ · {t.is_approved ? "Live" : "Hidden"}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => void handleDelete(t.id)}>
                Delete
              </Button>
            </div>
            <p className="mt-3 text-sm text-mist">&ldquo;{t.review}&rdquo;</p>
          </div>
        ))}
      </div>
    </>
  );
}
