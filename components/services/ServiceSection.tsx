import { Car, Home, Building2, Sticker, Check, ArrowRight } from "lucide-react";
import { categoryHueForAccent } from "@/lib/accents";
import type { Service } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TintGlass } from "@/components/ui/TintGlass";

const icons = { automotive: Car, residential: Home, commercial: Building2, decals: Sticker };

export function ServiceSection({
  service,
  reversed = false,
  showHeading = true,
}: {
  service: Service;
  reversed?: boolean;
  showHeading?: boolean;
}) {
  const accent = service.accent in icons ? service.accent : "automotive";
  const Icon = icons[accent];
  const hue = categoryHueForAccent[accent] ?? categoryHueForAccent.automotive;

  return (
    <section id={service.slug} className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className={reversed ? "lg:order-2" : ""}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <Badge tone="gold">From {service.startingAt}</Badge>
            </div>
            {showHeading && (
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {service.title}
              </h2>
            )}
            {showHeading && (
              <p className="mt-2 text-lg font-medium text-gold/90">{service.tagline}</p>
            )}
            <p className="mt-4 leading-relaxed text-mist">{service.description}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <div
                  key={feature.name}
                  className="rounded-xl border border-line bg-surface/60 p-4"
                >
                  <p className="text-sm font-semibold text-white">{feature.name}</p>
                  <p className="mt-1 text-sm text-mist">{feature.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-snow/70">
                Key benefits
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-snow/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {benefit}
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
                icon={service.featuredImageUrl ? undefined : <Icon />}
                label={service.featuredImageUrl ? undefined : service.title.replace(" Window Tinting", "")}
                sublabel={service.featuredImageUrl ? undefined : "Example project"}
                imageUrl={service.featuredImageUrl}
                alt={service.title}
              />
              <TintGlass
                hue={hue + 20}
                className="aspect-square"
                sublabel={service.detailImageUrl ? undefined : "Detail"}
                imageUrl={service.detailImageUrl}
                alt={`${service.title} detail`}
              />
              <TintGlass
                hue={hue - 20}
                className="aspect-square"
                sublabel={service.finishImageUrl ? undefined : "Finish"}
                imageUrl={service.finishImageUrl}
                alt={`${service.title} finish`}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
