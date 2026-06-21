"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import {
  galleryItems,
  galleryCategories,
  categoryHue,
  type GalleryItem,
} from "@/lib/data";
import { TintGlass } from "@/components/ui/TintGlass";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const filters = ["All", ...galleryCategories] as const;

export function GalleryGrid({
  items = galleryItems,
}: {
  items?: (GalleryItem & { imageUrl?: string })[];
}) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? items
        : items.filter((g) => g.category === active),
    [active, items],
  );

  const current: GalleryItem | null =
    lightbox !== null ? filtered[lightbox] ?? null : null;

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox((i) => (i === null ? i : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setLightbox((i) =>
          i === null ? i : (i - 1 + filtered.length) % filtered.length,
        );
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, filtered.length]);

  return (
    <>
      {/* Filter bar (visual control) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setActive(f);
              setLightbox(null);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active === f
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-line bg-charcoal-light text-snow/75 hover:border-gold/30 hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(idx)}
            className="group/item text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-2xl"
          >
            <TintGlass
              hue={categoryHue[item.category]}
              className={cn(
                "aspect-square cursor-pointer transition-transform duration-300 group-hover/item:scale-[1.02]",
                idx % 7 === 0 && "sm:aspect-[1/1.3]",
              )}
              badge={item.tint}
              imageUrl={item.imageUrl}
            />
            <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {item.title}
                </p>
                <p className="truncate text-xs text-mist">{item.detail}</p>
              </div>
              <Maximize2 className="h-4 w-4 shrink-0 text-mist transition-colors group-hover/item:text-gold" />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-mist">No projects in this category yet.</p>
      )}

      {/* Lightbox modal */}
      {current && lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-line bg-charcoal-light text-snow hover:border-gold/40 hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) =>
                i === null ? i : (i - 1 + filtered.length) % filtered.length,
              );
            }}
            className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-charcoal-light text-snow hover:border-gold/40 hover:text-gold sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TintGlass
              hue={categoryHue[current.category]}
              className="aspect-[16/10] w-full"
              badge={current.tint}
              icon={current.imageUrl ? undefined : <Maximize2 />}
              imageUrl={current.imageUrl}
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">
                  {current.title}
                </h3>
                <p className="mt-1 text-sm text-mist">{current.detail}</p>
              </div>
              <Badge tone="gold">{current.category}</Badge>
            </div>
          </div>

          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => (i === null ? i : (i + 1) % filtered.length));
            }}
            className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-charcoal-light text-snow hover:border-gold/40 hover:text-gold sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
