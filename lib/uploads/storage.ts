import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  CLIENT_UPLOAD_BUCKET,
  MAX_CLIENT_FILES,
  clientFileTooLarge,
  isAllowedClientFile,
} from "@/lib/uploads/constants";

export type ClientUploadResult =
  | { success: true; urls: string[] }
  | { success: false; error: string };

function storagePath(prefix: "bookings" | "quotes", file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

export async function uploadClientFiles(
  files: File[],
  prefix: "bookings" | "quotes",
): Promise<ClientUploadResult> {
  if (files.length === 0) {
    return { success: true, urls: [] };
  }

  if (files.length > MAX_CLIENT_FILES) {
    return { success: false, error: `You can upload up to ${MAX_CLIENT_FILES} files.` };
  }

  for (const file of files) {
    if (!isAllowedClientFile(file)) {
      return { success: false, error: "Only images (JPG, PNG, WebP, GIF) and PDF files are allowed." };
    }
    if (clientFileTooLarge(file)) {
      return { success: false, error: "Each file must be 5 MB or smaller." };
    }
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "File uploads are not available right now. Please try again later." };
  }

  const admin = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    const path = storagePath(prefix, file);
    const { error } = await admin.storage.from(CLIENT_UPLOAD_BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      console.error("[uploadClientFiles]", error.message);
      return { success: false, error: "Could not upload one or more files. Please try again." };
    }

    const { data } = admin.storage.from(CLIENT_UPLOAD_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { success: true, urls };
}

export function filesFromFormData(formData: FormData, field = "files"): File[] {
  return formData
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}
