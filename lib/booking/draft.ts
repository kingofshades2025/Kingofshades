const DRAFT_KEY = "kos-booking-draft-v1";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type BookingDraft = {
  step: number;
  service: string | null;
  tint: string;
  tintType: string;
  dateIso: string | null;
  slot: string | null;
  details: Record<string, string>;
  photoUrls: string[];
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  savedAt: number;
};

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as BookingDraft;
    if (!draft || typeof draft.savedAt !== "number") return null;
    if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      clearBookingDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveBookingDraft(
  draft: Omit<BookingDraft, "savedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: BookingDraft = { ...draft, savedAt: Date.now() };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore.
  }
}
