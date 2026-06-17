import { cn } from "@/lib/utils";

/*
 * A self-contained "tinted glass" media placeholder. It renders a premium,
 * automotive-glass look entirely with CSS (no external images) so the
 * prototype always looks polished offline. `hue` shifts the glass color.
 */
export function TintGlass({
  hue = 210,
  label,
  sublabel,
  badge,
  icon,
  className,
  intensity = 0.9,
}: {
  hue?: number;
  label?: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line",
        className,
      )}
      style={{
        background: `
          radial-gradient(120% 120% at 80% 0%, hsla(${hue}, 70%, 55%, ${0.22 * intensity}) 0%, transparent 55%),
          radial-gradient(120% 120% at 0% 100%, hsla(${hue + 30}, 60%, 40%, ${0.18 * intensity}) 0%, transparent 50%),
          linear-gradient(135deg, hsl(${hue}, 30%, 12%) 0%, #0d0d0d 55%, #060606 100%)
        `,
      }}
    >
      {/* glass reflection streaks */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.07) 45%, rgba(255,255,255,0.02) 50%, transparent 60%)",
        }}
      />
      {/* subtle grid sheen */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      {/* moving highlight on hover */}
      <div
        className="pointer-events-none absolute -inset-x-1/2 -top-1/2 h-[200%] w-[60%] -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[250%]"
      />

      {badge && (
        <span className="absolute right-3 top-3 rounded-full border border-gold/30 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur">
          {badge}
        </span>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
        {icon && (
          <div className="mb-3 text-gold/80 [&>svg]:h-9 [&>svg]:w-9">{icon}</div>
        )}
        {label && (
          <p className="font-display text-sm font-semibold text-white/90 drop-shadow">
            {label}
          </p>
        )}
        {sublabel && (
          <p className="mt-1 text-xs text-white/55">{sublabel}</p>
        )}
      </div>

      {/* bottom gradient for depth */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
