"use client";

import { useState } from "react";
import { uploadSiteImage } from "@/app/actions/admin";
import { Field, Input } from "@/components/ui/Field";

const MAX_BYTES = 5 * 1024 * 1024;

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
  const [error, setError] = useState<string | null>(null);

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={url} />
      <Input
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null);
        }}
        placeholder="https://… or upload below"
      />
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > MAX_BYTES) {
            setError("Image must be 5 MB or smaller.");
            e.target.value = "";
            return;
          }
          setUploading(true);
          setError(null);
          try {
            const fd = new FormData();
            fd.set("file", file);
            const result = await uploadSiteImage(fd);
            if (result.success) {
              setUrl(result.url);
            } else {
              setError(result.error);
            }
          } catch {
            setError("Upload failed. Please try again.");
          } finally {
            setUploading(false);
            e.target.value = "";
          }
        }}
        className="mt-2 text-sm text-mist file:mr-3 file:rounded-lg file:border file:border-line file:bg-charcoal-light file:px-3 file:py-1.5 file:text-sm file:text-snow"
      />
      {uploading && <p className="mt-1 text-xs text-gold">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
