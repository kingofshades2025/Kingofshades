"use client";

import { useState } from "react";
import { uploadSiteImage } from "@/app/actions/admin";
import { Field, Input } from "@/components/ui/Field";

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={url} />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://… or upload below"
      />
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const fd = new FormData();
            fd.set("file", file);
            const result = await uploadSiteImage(fd);
            if (result.success) setUrl(result.url);
          } finally {
            setUploading(false);
            e.target.value = "";
          }
        }}
        className="mt-2 text-sm text-mist file:mr-3 file:rounded-lg file:border file:border-line file:bg-charcoal-light file:px-3 file:py-1.5 file:text-sm file:text-snow"
      />
      {uploading && <p className="mt-1 text-xs text-gold">Uploading…</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-3 aspect-video w-full max-w-xs rounded-lg border border-line object-cover"
        />
      )}
    </Field>
  );
}
