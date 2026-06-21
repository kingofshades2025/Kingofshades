import Link from "next/link";
import { Car, Home, Building2, Sticker, ArrowRight, Check } from "lucide-react";
import type { Service } from "@/lib/data";
import { categoryHueForAccent } from "@/lib/accents";
import { Card } from "@/components/ui/Card";
import { TintGlass } from "@/components/ui/TintGlass";

const icons = {
  automotive: Car,
  residential: Home,
  commercial: Building2,
  decals: Sticker,
} as const;

export function ServiceCard({ service }: { service: Service }) {
  const Icon = icons[service.accent];
  const hue = categoryHueForAccent[service.accent];

  return (
    <Card hover className="flex flex-col overflow-hidden">
      <TintGlass
        hue={hue}
        className="h-44 rounded-b-none border-0 border-b"
        icon={service.featuredImageUrl ? undefined : <Icon />}
        sublabel={service.featuredImageUrl ? undefined : `From ${service.startingAt}`}
        imageUrl={service.featuredImageUrl}
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-semibold text-white">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          {service.tagline}
        </p>
        <ul className="mt-4 space-y-2">
          {service.benefits.slice(0, 3).map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-snow/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {b}
            </li>
          ))}
        </ul>
        <Link
          href={`/services#${service.slug}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
        >
          Learn more
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
