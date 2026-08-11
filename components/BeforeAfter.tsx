"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function BeforeAfter({
  className,
  label,
  beforeImage,
  afterImage,
}: {
  className?: string;
  /** @deprecated Kept for callers; empty state is photographic, not hue-based. */
  hue?: number;
  label?: string;
  beforeImage?: string | null;
  afterImage?: string | null;
}) {
  const [pos, setPos] = useState(50);
  const [beforeFailed, setBeforeFailed] = useState(false);
  const [afterFailed, setAfterFailed] = useState(false);

  const showAfter = Boolean(afterImage) && !afterFailed;
  const showBefore = Boolean(beforeImage) && !beforeFailed;

  const afterStyle = showAfter
    ? undefined
    : {
        background:
          "radial-gradient(90% 70% at 50% 30%, rgba(212,175,55,0.10) 0%, transparent 55%), linear-gradient(165deg, #1a1a1a 0%, #0c0c0c 50%, #070707 100%)",
      };

  const beforeStyle = showBefore
    ? undefined
    : {
        background:
          "radial-gradient(90% 70% at 40% 20%, rgba(255,255,255,0.08) 0%, transparent 50%), linear-gradient(165deg, #2a2a2a 0%, #141414 55%, #0a0a0a 100%)",
      };

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden rounded-2xl border border-line",
        className,
      )}
    >
      <div className="absolute inset-0" style={afterStyle}>
        {showAfter ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterImage!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setAfterFailed(true)}
          />
        ) : (
          <div className="bg-grid absolute inset-0 opacity-25" />
        )}
        <span className="absolute bottom-3 right-3 z-10 rounded-full border border-gold/30 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur">
          After — Tinted
        </span>
      </div>

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, ...beforeStyle }}
      >
        {showBefore ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={beforeImage!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setBeforeFailed(true)}
          />
        ) : (
          <div className="bg-grid absolute inset-0 opacity-20" />
        )}
        <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-snow/80 backdrop-blur">
          Before
        </span>
      </div>

      {label && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
          {label}
        </span>
      )}

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-gold"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold bg-ink text-gold shadow-glow">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal before and after tint"
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
