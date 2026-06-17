import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface/80 backdrop-blur-sm",
        hover &&
          "transition-all duration-300 hover:border-gold/40 hover:bg-charcoal-light hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(212,175,55,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
