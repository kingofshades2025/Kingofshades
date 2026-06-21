"use client";

import { useTransition } from "react";
import type { GalleryItem, GalleryCategory } from "@/lib/types/database";
import { galleryCategories } from "@/lib/data";
import { deleteGalleryItem, upsertGalleryItem } from "@/app/actions/admin";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <AdminPageHeader title="Gallery" subtitle="Upload and organize project photos." />

      <form
        action={(fd) => startTransition(() => { void upsertGalleryItem(fd); })}
        className="mb-6 grid gap-4 rounded-2xl border border-line bg-surface/70 p-6 sm:grid-cols-2"
      >
        <Field label="Title"><Input name="title" required /></Field>
        <Field label="Category">
          <Select name="category" required defaultValue="Cars">
            {galleryCategories.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Description" className="sm:col-span-2"><Textarea name="description" /></Field>
        <Field label="Tint"><Input name="tint" placeholder="20%" /></Field>
        <ImageUploadField name="image_url" label="Project photo" />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>Add to gallery</Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-surface/70 p-4">
            <p className="font-medium text-white">{item.title}</p>
            <p className="text-xs text-mist">{item.category}{item.tint ? ` · ${item.tint}` : ""}</p>
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="mt-3 aspect-video w-full rounded-lg object-cover" />
            )}
            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              disabled={isPending}
              onClick={() => startTransition(() => { void deleteGalleryItem(item.id); })}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
