import { cn } from "@/lib/utils";

type Tone = "gold" | "green" | "amber" | "red" | "blue" | "neutral";

const tones: Record<Tone, string> = {
  gold: "bg-gold/15 text-gold border-gold/30",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  blue: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  neutral: "bg-white/8 text-mist border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
