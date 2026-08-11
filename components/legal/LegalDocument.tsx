import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";

export function LegalDocument({
  eyebrow,
  title,
  description,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="py-14 sm:py-16">
        <Container>
          <p className="text-xs uppercase tracking-wider text-mist">
            Last updated {updated}
          </p>
          <div className="legal-prose mt-8 max-w-3xl space-y-8 text-sm leading-relaxed text-snow/85 sm:text-base">
            {children}
          </div>
        </Container>
      </section>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
