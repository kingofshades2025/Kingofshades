export type ServiceFormKind = "automotive" | "residential" | "commercial" | "decals";

const FORM_KINDS: ServiceFormKind[] = ["automotive", "residential", "commercial", "decals"];

const ICON_TO_KIND: Record<string, ServiceFormKind> = {
  car: "automotive",
  home: "residential",
  building: "commercial",
  sticker: "decals",
};

export const ICON_BY_KIND: Record<ServiceFormKind, string> = {
  automotive: "car",
  residential: "home",
  commercial: "building",
  decals: "sticker",
};

export function resolveServiceFormKind(input: {
  id: string;
  accent?: string | null;
  category?: string | null;
  icon?: string;
}): ServiceFormKind {
  const accent = (input.accent ?? input.category ?? "").trim().toLowerCase();
  if (FORM_KINDS.includes(accent as ServiceFormKind)) return accent as ServiceFormKind;
  if (FORM_KINDS.includes(input.id as ServiceFormKind)) return input.id as ServiceFormKind;
  const fromIcon = input.icon ? ICON_TO_KIND[input.icon] : undefined;
  if (fromIcon) return fromIcon;
  return "residential";
}
