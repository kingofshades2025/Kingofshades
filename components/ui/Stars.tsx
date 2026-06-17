import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating = 5,
  className,
  size = "md",
}: {
  rating?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            dim,
            i < rating ? "fill-gold text-gold" : "fill-transparent text-line",
          )}
        />
      ))}
    </div>
  );
}
