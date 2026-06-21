"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/lib/types/database";
import { deleteService, upsertService } from "@/app/actions/admin";
import { featuresToLines, listToLines } from "@/lib/cms";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { AdminPageHeader } from "@/components/admin/AdminUI";

export function ServicesManager({
  services,
  loadError,
}: {
  services: Service[];
  loadError?: string | null;
}) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const { run, isPending, message, error, clearFeedback } = useAdminAction(upsertService, {
    successMessage: "Service saved.",
    onSuccess: () => setEditing(null),
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this service?")) return;
    setDeleteError(null);
    startDelete(() => {
      void (async () => {
        const result = await deleteService(id);
        if (result.success) {
          if (editing?.id === id) setEditing(null);
        } else {
          setDeleteError(result.error);
        }
      })();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Services"
        subtitle="Manage services shown on the public website."
        actions={
          <Button
            size="sm"
            onClick={() => {
              clearFeedback();
              setDeleteError(null);
              setEditing({} as Service);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {loadError && <AdminFeedback error={loadError} className="mb-4" />}
      <AdminFeedback message={message} error={error ?? deleteError} className="mb-4" />

      {editing && (
        <form action={run} className="mb-6 rounded-2xl border border-gold/30 bg-surface/70 p-6">
          {editing.id && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input name="title" defaultValue={editing.title} required />
            </Field>
            <Field label="Slug">
              <Input name="slug" defaultValue={editing.slug} placeholder="automotive" />
            </Field>
            <Field label="Category / accent">
              <Select name="accent" defaultValue={editing.accent ?? "automotive"}>
                <option value="automotive">Automotive</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="decals">Decals</option>
              </Select>
            </Field>
            <Field label="Price label">
              <Input name="price_label" defaultValue={editing.price_label ?? ""} placeholder="$199" />
            </Field>
            <Field label="Tagline" className="sm:col-span-2">
              <Input name="tagline" defaultValue={editing.tagline ?? ""} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea name="description" defaultValue={editing.description ?? ""} />
            </Field>
            <Field label="Benefits (one per line)" className="sm:col-span-2">
              <Textarea name="benefits_lines" rows={4} defaultValue={listToLines(editing.benefits ?? [])} />
            </Field>
            <Field label="Feature boxes (Name|Detail per line)" className="sm:col-span-2">
              <Textarea name="features_lines" rows={4} defaultValue={featuresToLines(editing.features ?? [])} />
            </Field>
            <ImageUploadField
              name="featured_image_url"
              label="Main photo"
              defaultValue={editing.featured_image_url ?? ""}
              hint="Large image on the service page and homepage card."
            />
            <ImageUploadField
              name="detail_image_url"
              label="Detail photo"
              defaultValue={editing.detail_image_url ?? ""}
            />
            <ImageUploadField
              name="finish_image_url"
              label="Finish photo"
              defaultValue={editing.finish_image_url ?? ""}
            />
            <Field label="Status">
              <Select name="is_active" defaultValue={editing.is_active === false ? "false" : "true"}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isPending}>Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-2xl border border-line bg-surface/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-white">{service.title}</h3>
                <Badge tone="gold" className="mt-1">From {service.price_label}</Badge>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    clearFeedback();
                    setDeleteError(null);
                    setEditing(service);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() => handleDelete(service.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm text-mist">{service.tagline}</p>
            <p className="mt-3 text-xs text-mist">
              {service.is_active ? "● Active" : "○ Inactive"} · /{service.slug}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
