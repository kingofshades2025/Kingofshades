"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Paperclip, X } from "lucide-react";
import { uploadBookingFiles } from "@/app/actions/uploads";
import { Field } from "@/components/ui/Field";
import {
  CLIENT_FILE_ACCEPT,
  MAX_CLIENT_FILES,
  MAX_CLIENT_FILE_BYTES,
  clientFileTooLarge,
  isAllowedClientFile,
} from "@/lib/uploads/constants";
import { cn } from "@/lib/utils";

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  uploadAction?: (formData: FormData) => Promise<{ success: true; urls: string[] } | { success: false; error: string }>;
  label?: string;
  hint?: string;
  className?: string;
};

export function ClientFileUpload({
  value,
  onChange,
  uploadAction = uploadBookingFiles,
  label = "Reference photos / files",
  hint = `Up to ${MAX_CLIENT_FILES} files — images or PDF, 5 MB each`,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CLIENT_FILES - value.length;
  const canAdd = remaining > 0 && !uploading;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const picked = Array.from(fileList);
    if (picked.length > remaining) {
      setError(`You can add ${remaining} more file${remaining === 1 ? "" : "s"}.`);
      return;
    }

    for (const file of picked) {
      if (!isAllowedClientFile(file)) {
        setError("Only images (JPG, PNG, WebP, GIF) and PDF files are allowed.");
        return;
      }
      if (clientFileTooLarge(file)) {
        setError("Each file must be 5 MB or smaller.");
        return;
      }
    }

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const file of picked) fd.append("files", file);
      const result = await uploadAction(fd);
      if (result.success) {
        onChange([...value, ...result.urls]);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Field label={label} className={cn("sm:col-span-2", className)}>
      <div
        className={cn(
          "rounded-2xl border border-dashed border-line bg-charcoal-light/40 p-4 transition-colors",
          canAdd && "hover:border-gold/30",
        )}
      >
        {value.length > 0 && (
          <ul className="mb-3 space-y-2">
            {value.map((url) => (
              <li
                key={url}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-3 py-2"
              >
                {isPdfUrl(url) ? (
                  <FileText className="h-5 w-5 shrink-0 text-gold" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover" />
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-sm text-gold hover:underline"
                >
                  {isPdfUrl(url) ? "PDF attachment" : "View image"}
                </a>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((u) => u !== url))}
                  className="rounded-lg p-1 text-mist hover:bg-white/5 hover:text-red-300"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={CLIENT_FILE_ACCEPT}
          multiple
          disabled={!canAdd}
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={!canAdd}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-medium transition-colors",
            canAdd
              ? "bg-charcoal-light text-snow hover:border-gold/40 hover:text-gold"
              : "cursor-not-allowed text-mist opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Paperclip className="h-4 w-4" />
              {value.length === 0 ? "Add photos or PDFs" : `Add more (${remaining} left)`}
            </>
          )}
        </button>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-mist">
          <ImageIcon className="h-3.5 w-3.5" />
          {hint}
        </p>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </Field>
  );
}

export function UploadedFilesGallery({ urls, compact }: { urls: string[]; compact?: boolean }) {
  if (!urls.length) return null;

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-3"}>
      {urls.map((url) =>
        isPdfUrl(url) ? (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-line bg-charcoal-light px-3 py-2 text-xs text-gold hover:border-gold/40"
          >
            <FileText className="h-4 w-4 shrink-0" />
            PDF
          </a>
        ) : (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-lg border border-line hover:border-gold/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className={compact ? "h-14 w-14 object-cover" : "aspect-video w-full object-cover"} />
          </a>
        ),
      )}
    </div>
  );
}

export function photoUrlsFromDetails(details: Record<string, unknown> | null | undefined): string[] {
  const raw = details?.photo_urls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.length > 0);
}
