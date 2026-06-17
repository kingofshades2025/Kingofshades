import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="King of Shades home"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-gold/40 bg-gradient-to-br from-charcoal-lighter to-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Crown className="h-5 w-5 text-gold transition-transform duration-300 group-hover:-translate-y-0.5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-white">
            King of <span className="text-gradient-gold">Shades</span>
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-mist">
            Premium Tint Co.
          </span>
        </span>
      )}
    </Link>
  );
}
