export const CLIENT_UPLOAD_BUCKET = "client-uploads";

export const MAX_CLIENT_FILES = 5;
export const MAX_CLIENT_FILE_BYTES = 5 * 1024 * 1024;

export const CLIENT_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const PDF_EXTENSIONS = new Set(["pdf"]);

const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const PDF_MIME = new Set(["application/pdf"]);

export function isAllowedClientFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext) || PDF_EXTENSIONS.has(ext)) return true;
  return IMAGE_MIME.has(file.type) || PDF_MIME.has(file.type);
}

export function clientFileTooLarge(file: File): boolean {
  return file.size > MAX_CLIENT_FILE_BYTES;
}
