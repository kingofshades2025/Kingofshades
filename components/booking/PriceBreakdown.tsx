import { formatBreakdownAmount, type PriceBreakdownLine } from "@/lib/booking/pricing";
import { cn } from "@/lib/utils";

type PriceBreakdownProps = {
  lines: PriceBreakdownLine[];
  className?: string;
};

const emphasisStyles: Record<NonNullable<PriceBreakdownLine["emphasis"]>, string> = {
  muted: "text-mist",
  default: "text-snow",
  strong: "text-white font-semibold",
  accent: "text-gold",
};

export function PriceBreakdown({ lines, className }: PriceBreakdownProps) {
  return (
    <dl className={cn("space-y-3 text-sm", className)}>
      {lines.map((line) => {
        const emphasis = line.emphasis ?? (line.id === "tint" || line.id === "windows" ? "muted" : "default");
        const isTotal = line.id === "total";

        return (
          <div
            key={line.id}
            className={cn(
              "flex justify-between gap-4",
              line.dividerBefore && "border-t border-line pt-3",
              isTotal && "text-base",
            )}
          >
            <dt className={cn(emphasis === "accent" ? "text-gold" : emphasis === "strong" ? "text-white" : "text-mist")}>
              {line.label}
            </dt>
            <dd className={cn("shrink-0 tabular-nums", emphasisStyles[emphasis])}>
              {formatBreakdownAmount(line)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
