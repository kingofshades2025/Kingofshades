import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  size = "default",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  size?: "default" | "compact";
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line",
        size === "compact"
          ? "pt-28 pb-10 sm:pt-32 sm:pb-12"
          : "pt-36 pb-16 sm:pt-44 sm:pb-20",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 60%)",
        }}
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <Container className="relative text-center">
        {eyebrow && (
          <div className="flex justify-center">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        )}
        <h1
          className={cn(
            "mx-auto mt-5 max-w-3xl font-display font-extrabold tracking-tight text-white",
            size === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl leading-relaxed text-mist",
              size === "compact" ? "text-sm sm:text-base" : "mt-5 text-base sm:text-lg",
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
