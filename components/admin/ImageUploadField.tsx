"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { uploadSiteImage } from "@/app/actions/admin";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

function isAllowedImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    ["jpg", "jpeg", "png", "webp"].includes(ext) ||
    ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );
}

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  const uploadFile = useCallback(async (file: File) => {
    if (!isAllowedImage(file)) {
      setError("Use JPG, PNG, or WebP images only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
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
      if (inputRef.current) inputRef.current.value = "";
    }
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (file) void uploadFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUrl("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (uploading) return;
    handleFiles(e.dataTransfer.files);
  };

  const stopFormSubmit = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Field label={label} hint={hint} className={className}>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        disabled={uploading}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={stopFormSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed transition-colors",
          "border-line bg-charcoal-light/40",
          dragOver && "border-gold/60 bg-gold/5",
          !uploading && "cursor-pointer hover:border-gold/40 hover:bg-charcoal-light/60",
          uploading && "cursor-wait",
        )}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="aspect-video w-full max-h-48 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
            {!uploading && (
              <>
                <button
                  type="button"
                  onClick={clear}
                  className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/90"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  Click or drag to replace
                </span>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p className="mt-3 text-sm text-gold">Uploading…</p>
              </>
            ) : (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-surface/60">
                  <Upload className="h-5 w-5 text-gold" />
                </div>
                <p className="mt-3 text-sm font-medium text-snow">
                  {dragOver ? "Drop image here" : "Click or drag to upload"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-mist">
                  <ImageIcon className="h-3.5 w-3.5" />
                  JPG, PNG, WebP · max 5 MB
                </p>
              </>
            )}
          </div>
        )}

        {url && uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="mt-3 text-sm text-gold">Uploading…</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </Field>
  );
}
