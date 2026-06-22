"use server";

import { uploadClientFiles } from "@/lib/uploads/storage";

export async function uploadBookingFiles(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  return uploadClientFiles(files, "bookings");
}

export async function uploadQuoteFiles(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  return uploadClientFiles(files, "quotes");
}
