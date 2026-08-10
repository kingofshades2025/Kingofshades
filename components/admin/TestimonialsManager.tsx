"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/lib/types/database";
import { deleteTestimonial, upsertTestimonial } from "@/app/actions/admin";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const { run, isPending, message, error } = useAdminAction(upsertTestimonial, {
    successMessage: "Testimonial saved.",
    onSuccess: () => router.refresh(),
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setDeleteError(null);
    const result = await deleteTestimonial(id);
    if (!result.success) setDeleteError(result.error);
    else router.refresh();
  };

  const handleApprovalToggle = async (t: Testimonial) => {
    setDeleteError(null);
    setApprovingId(t.id);
    const fd = new FormData();
    fd.set("id", t.id);
    fd.set("customer_name", t.customer_name);
    fd.set("review", t.review);
    fd.set("role", t.role ?? "");
    fd.set("rating", String(t.rating ?? 5));
    fd.set("is_approved", t.is_approved ? "false" : "true");
    fd.set("sort_order", String(t.sort_order ?? 0));
    const result = await upsertTestimonial(fd);
    setApprovingId(null);
    if (!result.success) setDeleteError(result.error);
    else router.refresh();
  };

  const pending = testimonials.filter((t) => !t.is_approved);
  const approved = testimonials.filter((t) => t.is_approved);

  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        subtitle="Customer reviews arrive via invitation after completed appointments. Approve them here to show on the homepage."
      />

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

      {pending.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
            Pending approval ({pending.length})
          </h3>
          {pending.map((t) => (
            <div key={t.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{t.customer_name}</p>
                  <p className="text-xs text-mist">{t.role} · {t.rating}★ · Pending approval</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={approvingId === t.id}
                    onClick={() => void handleApprovalToggle(t)}
                  >
                    {approvingId === t.id ? "Saving…" : "Approve"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(t.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-mist">&ldquo;{t.review}&rdquo;</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {approved.length > 0 && (
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-mist">
            Live on site ({approved.length})
          </h3>
        )}
        {approved.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line bg-surface/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{t.customer_name}</p>
                <p className="text-xs text-mist">{t.role} · {t.rating}★ · Live</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={approvingId === t.id}
                  onClick={() => void handleApprovalToggle(t)}
                >
                  {approvingId === t.id ? "Saving…" : "Hide"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void handleDelete(t.id)}>
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-mist">&ldquo;{t.review}&rdquo;</p>
          </div>
        ))}
        {!testimonials.length && (
          <p className="rounded-2xl border border-line px-5 py-8 text-center text-sm text-mist">
            No testimonials yet.
          </p>
        )}
      </div>
    </>
  );
}
