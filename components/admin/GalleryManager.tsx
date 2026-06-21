"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { GalleryItem } from "@/lib/types/database";
import { galleryCategories } from "@/lib/data";
import { deleteGalleryItem, upsertGalleryItem } from "@/app/actions/admin";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminFeedback, useAdminAction } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { run, isPending, message, error, clearFeedback } = useAdminAction(upsertGalleryItem, {
    successMessage: editing?.id ? "Gallery item updated." : "Gallery item added.",
    onSuccess: () => setEditing(null),
  });

  const startAdd = () => {
    clearFeedback();
    setDeleteError(null);
    setEditing({} as GalleryItem);
  };

  const startEdit = (item: GalleryItem) => {
    clearFeedback();
    setDeleteError(null);
    setEditing(item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    setDeleteError(null);
    const result = await deleteGalleryItem(id);
    if (!result.success) setDeleteError(result.error);
    else if (editing?.id === id) setEditing(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        subtitle="Upload and organize project photos."
        actions={
          <Button size="sm" onClick={startAdd}>Add photo</Button>
        }
      />

      <AdminFeedback message={message} error={error ?? deleteError} className="mb-4" />

      {editing && (
        <form
          action={run}
          key={editing.id ?? "new"}
          className="mb-6 grid gap-4 rounded-2xl border border-gold/30 bg-surface/70 p-6 sm:grid-cols-2"
        >
          {editing.id && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Title"><Input name="title" defaultValue={editing.title ?? ""} required /></Field>
          <Field label="Category">
            <Select name="category" required defaultValue={editing.category ?? "Cars"}>
              {galleryCategories.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea name="description" defaultValue={editing.description ?? ""} />
          </Field>
          <Field label="Tint"><Input name="tint" defaultValue={editing.tint ?? ""} placeholder="20%" /></Field>
          <ImageUploadField name="image_url" label="Project photo" defaultValue={editing.image_url ?? ""} />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={isPending}>
              {editing.id ? "Update" : "Add to gallery"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-surface/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-xs text-mist">{item.category}{item.tint ? ` · ${item.tint}` : ""}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => startEdit(item)} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-gold">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void handleDelete(item.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="mt-3 aspect-video w-full rounded-lg object-cover" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
