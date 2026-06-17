import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-36 pb-16 sm:pt-44 sm:pb-20">
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
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
