import type { ContentSection } from "@/lib/types/database";
import {
  DEFAULT_CONTENT_SECTIONS,
  type CmsCard,
  type CmsFeatureStrip,
  type CmsProcessStep,
  type CmsStat,
  type CmsWhyChoose,
} from "@/lib/cms/defaults";

export * from "@/lib/cms/defaults";

export function mergeContentSections(
  dbSections: ContentSection[] | Record<string, ContentSection>,
): Record<string, ContentSection> {
  const merged = { ...DEFAULT_CONTENT_SECTIONS };
  const list = Array.isArray(dbSections)
    ? dbSections
    : Object.values(dbSections);

  for (const section of list) {
    const fallback = DEFAULT_CONTENT_SECTIONS[section.section_key];
    merged[section.section_key] = {
      ...(fallback ?? {
        id: section.section_key,
        section_key: section.section_key,
        title: null,
        body: null,
        metadata: {},
        updated_at: "",
      }),
      ...section,
      metadata: {
        ...(fallback?.metadata ?? {}),
        ...(section.metadata ?? {}),
      },
    };
  }

  return merged;
}

export function getSection(
  sections: Record<string, ContentSection>,
  key: string,
): ContentSection {
  return sections[key] ?? DEFAULT_CONTENT_SECTIONS[key];
}

export function sectionTitle(
  sections: Record<string, ContentSection>,
  key: string,
  fallback = "",
) {
  return getSection(sections, key).title ?? fallback;
}

export function sectionBody(
  sections: Record<string, ContentSection>,
  key: string,
  fallback = "",
) {
  return getSection(sections, key).body ?? fallback;
}

export function sectionMeta<T>(
  sections: Record<string, ContentSection>,
  key: string,
  metaKey: string,
  fallback: T,
): T {
  const value = getSection(sections, key).metadata?.[metaKey];
  return (value as T) ?? fallback;
}

export function sectionItems<T>(
  sections: Record<string, ContentSection>,
  key: string,
  itemKey: string,
  fallback: T[],
): T[] {
  const items = sectionMeta<unknown>(sections, key, itemKey, fallback);
  return Array.isArray(items) ? (items as T[]) : fallback;
}

export function getStats(sections: Record<string, ContentSection>): CmsStat[] {
  return sectionItems(sections, "homepage_stats", "items", []);
}

export function getFeatureStrip(
  sections: Record<string, ContentSection>,
): CmsFeatureStrip[] {
  return sectionItems(sections, "feature_strip", "items", []);
}

export function getWhyChoose(
  sections: Record<string, ContentSection>,
): CmsWhyChoose[] {
  return sectionItems(sections, "why_choose_section", "items", []);
}

export function getProcessSteps(
  sections: Record<string, ContentSection>,
): CmsProcessStep[] {
  return sectionItems(sections, "process_section", "steps", []);
}

export function getBeforeAfterCards(
  sections: Record<string, ContentSection>,
): CmsCard[] {
  return sectionItems(sections, "before_after_section", "cards", []);
}

/** Parse `label|value` lines for admin forms */
export function linesToStats(text: string): CmsStat[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, value] = line.split("|").map((p) => p.trim());
      return { label: label ?? "", value: value ?? "" };
    })
    .filter((item) => item.label && item.value);
}

export function statsToLines(items: CmsStat[]) {
  return items.map((item) => `${item.label}|${item.value}`).join("\n");
}

export function linesToFeatureStrip(text: string): CmsFeatureStrip[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, icon] = line.split("|").map((p) => p.trim());
      return { label: label ?? "", icon: icon ?? "shield" };
    })
    .filter((item) => item.label);
}

export function featureStripToLines(items: CmsFeatureStrip[]) {
  return items.map((item) => `${item.label}|${item.icon}`).join("\n");
}

export function linesToWhyChoose(text: string): CmsWhyChoose[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description, icon] = line.split("|").map((p) => p.trim());
      return {
        title: title ?? "",
        description: description ?? "",
        icon: icon ?? "shield",
      };
    })
    .filter((item) => item.title);
}

export function whyChooseToLines(items: CmsWhyChoose[]) {
  return items
    .map((item) => `${item.title}|${item.description}|${item.icon}`)
    .join("\n");
}

export function linesToProcessSteps(text: string): CmsProcessStep[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [step, title, description] = line.split("|").map((p) => p.trim());
      return { step: step ?? "", title: title ?? "", description: description ?? "" };
    })
    .filter((item) => item.title);
}

export function processStepsToLines(items: CmsProcessStep[]) {
  return items
    .map((item) => `${item.step}|${item.title}|${item.description}`)
    .join("\n");
}

export function linesToCards(text: string): CmsCard[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, textValue] = line.split("|").map((p) => p.trim());
      return { title: title ?? "", text: textValue ?? "" };
    })
    .filter((item) => item.title);
}

export function cardsToLines(items: CmsCard[]) {
  return items.map((item) => `${item.title}|${item.text}`).join("\n");
}

export function linesToList(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(items: string[]) {
  return items.join("\n");
}

export function linesToFeatures(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, detail] = line.split("|").map((p) => p.trim());
      return { name: name ?? "", detail: detail ?? "" };
    })
    .filter((item) => item.name);
}

export function featuresToLines(
  items: { name: string; detail: string }[],
) {
  return items.map((item) => `${item.name}|${item.detail}`).join("\n");
}
