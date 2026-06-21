import type { Metadata } from "next";
import { Car, Home, Building2, Sticker, Check, ArrowRight } from "lucide-react";
import { services } from "@/lib/data";
import { categoryHueForAccent } from "@/lib/accents";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TintGlass } from "@/components/ui/TintGlass";
import { PageHeader } from "@/components/sections/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Automotive, residential, and commercial window tinting plus custom decals and vinyl graphics.",
};

const icons = { automotive: Car, residential: Home, commercial: Building2, decals: Sticker };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Services"
        title="Premium film for every surface"
        description="Whether it's a single windshield or an entire commercial facade, we match the right film to your goals — heat, privacy, security, or pure style."
      >
        <div className="flex flex-wrap justify-center gap-2">
          {services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-line bg-charcoal-light px-4 py-2 text-sm font-medium text-snow/80 transition-colors hover:border-gold/40 hover:text-gold"
            >
              {s.title.replace(" Window Tinting", "")}
            </a>
          ))}
        </div>
      </PageHeader>

      {services.map((service, i) => {
        const Icon = icons[service.accent];
        const hue = categoryHueForAccent[service.accent];
        const reversed = i % 2 === 1;
        return (
          <section
            key={service.slug}
            id={service.slug}
            className={`scroll-mt-24 py-20 sm:py-24 ${i % 2 === 1 ? "bg-charcoal/40" : ""}`}
          >
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className={reversed ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge tone="gold">From {service.startingAt}</Badge>
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-lg font-medium text-gold/90">
                    {service.tagline}
                  </p>
                  <p className="mt-4 leading-relaxed text-mist">
                    {service.description}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {service.features.map((f) => (
                      <div
                        key={f.name}
                        className="rounded-xl border border-line bg-surface/60 p-4"
                      >
                        <p className="text-sm font-semibold text-white">{f.name}</p>
                        <p className="mt-1 text-sm text-mist">{f.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-snow/70">
                      Key benefits
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {service.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-snow/85">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href="/booking">
                      Book this service
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button href="/contact" variant="outline">
                      Get a quote
                    </Button>
                  </div>
                </div>

                <div className={reversed ? "lg:order-1" : ""}>
                  <div className="grid grid-cols-2 gap-4">
                    <TintGlass
                      hue={hue}
                      className="col-span-2 aspect-[16/10]"
                      icon={<Icon />}
                      label={service.title.replace(" Window Tinting", "")}
                      sublabel="Example project"
                    />
                    <TintGlass hue={hue + 20} className="aspect-square" sublabel="Detail" />
                    <TintGlass hue={hue - 20} className="aspect-square" sublabel="Finish" />
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <CtaBand
        title="Not sure which film is right?"
        description="Tell us about your vehicle or property and we'll recommend the perfect film and shade — free of charge."
      />
    </>
  );
}
