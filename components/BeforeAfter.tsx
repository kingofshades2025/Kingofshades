"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function BeforeAfter({
  className,
  hue = 210,
  label,
  beforeImage,
  afterImage,
}: {
  className?: string;
  hue?: number;
  label?: string;
  beforeImage?: string | null;
  afterImage?: string | null;
}) {
  const [pos, setPos] = useState(50);

  const afterStyle = afterImage
    ? undefined
    : {
        background: `radial-gradient(120% 120% at 80% 10%, hsla(${hue},65%,45%,0.30) 0%, transparent 55%), linear-gradient(135deg, hsl(${hue},28%,11%) 0%, #070707 100%)`,
      };

  const beforeStyle = beforeImage
    ? undefined
    : {
        background:
          "radial-gradient(120% 120% at 75% 0%, rgba(255,250,235,0.85) 0%, rgba(220,225,235,0.55) 35%, rgba(150,165,185,0.5) 100%)",
      };

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden rounded-2xl border border-line",
        className,
      )}
    >
      <div className="absolute inset-0" style={afterStyle}>
        {afterImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={afterImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="bg-grid absolute inset-0 opacity-30" />
        )}
        <span className="absolute bottom-3 right-3 z-10 rounded-full border border-gold/30 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur">
          After — Tinted
        </span>
      </div>

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, ...beforeStyle }}
      >
        {beforeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beforeImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.9) 47%, transparent 56%)",
            }}
          />
        )}
        <span className="absolute bottom-3 left-3 z-10 rounded-full border border-black/20 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-black/80 backdrop-blur">
          Before — Glare
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
