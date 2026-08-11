import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Gem,
  Clock,
  Sun,
  Snowflake,
  Eye,
  Quote,
} from "lucide-react";
import { services as mockServices, testimonials as mockTestimonials } from "@/lib/data";
import {
  getServices,
  getTestimonials,
  getHomepageContent,
  getSiteSettings,
} from "@/lib/queries/public";
import { getSection, sectionMeta, getBeforeAfterCards, metaImage } from "@/lib/cms";
import { toLegacyService, toLegacyTestimonial } from "@/lib/adapters";
import { toSiteConfig } from "@/lib/site-config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stars } from "@/components/ui/Stars";
import { TintGlass } from "@/components/ui/TintGlass";
import { ServiceCard } from "@/components/ServiceCard";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CtaBand } from "@/components/sections/CtaBand";

const whyIcons = { shield: ShieldCheck, badge: BadgeCheck, gem: Gem, clock: Clock };
const stripIcons = { sun: Sun, snowflake: Snowflake, eye: Eye, shield: ShieldCheck };

export default async function HomePage() {
  const [{ sections, stats, featureStrip, whyChoose, processSteps }, dbServices, dbTestimonials, settings] =
    await Promise.all([
      getHomepageContent(),
      getServices(),
      getTestimonials(),
      getSiteSettings(),
    ]);

  const site = toSiteConfig(settings);
  const cta = getSection(sections, "cta_band");
  const about = getSection(sections, "about_section");
  const servicesSection = getSection(sections, "services_section");
  const whySection = getSection(sections, "why_choose_section");
  const beforeAfter = getSection(sections, "before_after_section");
  const processSection = getSection(sections, "process_section");
  const testimonialsSection = getSection(sections, "testimonials_section");
  const heroVisual = getSection(sections, "hero_visual");
  const beforeAfterCards = getBeforeAfterCards(sections);
  const heroImageUrl = metaImage(sections, "hero_visual", "image_url");

  const services = dbServices.length
    ? dbServices.slice(0, 4).map(toLegacyService)
    : mockServices;
  const testimonials = dbTestimonials.length
    ? dbTestimonials.map(toLegacyTestimonial)
    : mockTestimonials;

  const heroTitle = getSection(sections, "hero_title").title ?? "";
  const heroHighlight = sectionMeta(sections, "hero_title", "highlight", "Window Tinting");
  const heroSubtitle = getSection(sections, "hero_subtitle").body ?? "";
  const aboutBulletsRaw = sectionMeta<string[]>(sections, "about_section", "bullets", []);
  const aboutBullets = Array.isArray(aboutBulletsRaw)
    ? aboutBulletsRaw.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const aboutImageUrl = metaImage(sections, "about_section", "image_url");

  return (
    <>
      <section className="relative flex min-h-[78svh] items-center overflow-hidden sm:min-h-[82svh] lg:min-h-[720px]">
        <div className="absolute inset-0">
          {heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt={heroVisual.title || `${site.name} window tinting`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              aria-hidden
              style={{
                background: `
                  radial-gradient(80% 60% at 70% 20%, rgba(212,175,55,0.18) 0%, transparent 55%),
                  radial-gradient(50% 40% at 10% 80%, rgba(42,91,215,0.12) 0%, transparent 50%),
                  linear-gradient(160deg, #121212 0%, #0a0a0a 55%, #050505 100%)
                `,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-25" />
        </div>

        <Container className="relative w-full py-28 sm:py-32">
          <div className="max-w-2xl">
            <p className="animate-fade-up font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              King of <span className="text-gradient-gold">Shades</span>
            </p>
            <p
              className="animate-fade-up mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold/90 sm:text-xs"
              style={{ animationDelay: "80ms" }}
            >
              Premium Tint Co.
            </p>
            <h1
              className="animate-fade-up mt-6 font-display text-xl font-semibold leading-snug tracking-tight text-snow/95 sm:mt-7 sm:text-2xl lg:text-3xl"
              style={{ animationDelay: "140ms" }}
            >
              {heroTitle.includes(heroHighlight) ? (
                <>
                  {heroTitle.split(heroHighlight)[0]}
                  <span className="text-gradient-gold">{heroHighlight}</span>
                  {heroTitle.split(heroHighlight)[1]}
                </>
              ) : (
                heroTitle
              )}
            </h1>
            <p
              className="animate-fade-up mt-4 max-w-lg text-base leading-relaxed text-mist sm:text-lg"
              style={{ animationDelay: "200ms" }}
            >
              {heroSubtitle}
            </p>
            <div
              className="animate-fade-up mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center"
              style={{ animationDelay: "280ms" }}
            >
              <Button href="/booking" size="lg" className="w-full sm:w-auto">
                Book Appointment
              </Button>
              <Button href="/contact" variant="outline" size="lg" className="w-full sm:w-auto">
                Get a Quote
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <div className="border-y border-line bg-charcoal/60">
        <Container className="py-5 sm:py-6">
          <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-y-0 sm:divide-x">
            {featureStrip.map(({ icon, label }) => {
              const Icon = stripIcons[icon as keyof typeof stripIcons] ?? ShieldCheck;
              return (
                <div
                  key={label}
                  className="flex items-center justify-center gap-2 px-2 py-1 sm:gap-3 sm:px-0 sm:py-0"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold sm:h-5 sm:w-5" />
                  <span className="text-center text-xs font-medium leading-snug text-snow/85 sm:text-sm">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="gold-divider mx-auto mt-5 h-px w-full max-w-3xl opacity-40 sm:mt-6" />
          <dl className="mt-5 grid grid-cols-2 gap-6 sm:mt-6 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="font-display text-xl font-bold text-white sm:text-2xl">{s.value}</dt>
                <dd className="mt-1 text-[0.65rem] uppercase tracking-wider text-mist sm:text-xs">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <TintGlass
              hue={280}
              className="aspect-[5/4]"
              label={aboutImageUrl ? undefined : String(sectionMeta(sections, "about_section", "visual_label", ""))}
              sublabel={aboutImageUrl ? undefined : String(sectionMeta(sections, "about_section", "visual_sublabel", ""))}
              imageUrl={aboutImageUrl}
            />
            <div className="absolute -bottom-5 right-6 rounded-2xl border border-gold/30 bg-ink/90 px-5 py-4 backdrop-blur">
              <p className="font-display text-3xl font-bold text-gradient-gold">
                {String(sectionMeta(sections, "about_section", "stat_value", ""))}
              </p>
              <p className="text-xs uppercase tracking-wider text-mist">
                {String(sectionMeta(sections, "about_section", "stat_label", ""))}
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={String(sectionMeta(sections, "about_section", "eyebrow", ""))}
              title={about.title ?? ""}
              description={about.body ?? ""}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {aboutBullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-snow/85">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/services" variant="outline">
                Explore our services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-charcoal/40">
        <SectionHeading
          align="center"
          eyebrow={String(sectionMeta(sections, "services_section", "eyebrow", ""))}
          title={servicesSection.title ?? ""}
          description={servicesSection.body ?? ""}
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow={String(sectionMeta(sections, "why_choose_section", "eyebrow", ""))}
            title={whySection.title ?? ""}
            description={whySection.body ?? ""}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {whyChoose.map((item) => {
              const Icon = whyIcons[item.icon as keyof typeof whyIcons] ?? ShieldCheck;
              return (
                <Card key={item.title} hover className="p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="bg-charcoal/40">
        <SectionHeading
          align="center"
          eyebrow={String(sectionMeta(sections, "before_after_section", "eyebrow", ""))}
          title={beforeAfter.title ?? ""}
          description={beforeAfter.body ?? ""}
        />
        <div className="mx-auto mt-12 max-w-4xl">
          <BeforeAfter
            hue={28}
            className="aspect-[16/9]"
            label={String(sectionMeta(sections, "before_after_section", "slider_label", ""))}
            beforeImage={metaImage(sections, "before_after_section", "before_image_url")}
            afterImage={metaImage(sections, "before_after_section", "after_image_url")}
          />
        </div>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-3">
          {beforeAfterCards.map((c) => (
            <Card key={c.title} className="p-5">
              <p className="font-display text-sm font-semibold text-gold">{c.title}</p>
              <p className="mt-1 text-sm text-mist">{c.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="center"
          eyebrow={String(sectionMeta(sections, "process_section", "eyebrow", ""))}
          title={processSection.title ?? ""}
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <div key={step.step} className="relative rounded-2xl border border-line bg-surface/60 p-6">
              <span className="font-display text-4xl font-bold text-gold/25">{step.step}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-charcoal/40">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={String(sectionMeta(sections, "testimonials_section", "eyebrow", ""))}
            title={testimonialsSection.title ?? ""}
          />
          <div className="flex items-center gap-3">
            <Stars rating={5} />
            <span className="text-sm text-mist">
              {String(sectionMeta(sections, "testimonials_section", "rating_text", ""))}
            </span>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-7">
              <Quote className="h-8 w-8 text-gold/30" />
              <p className="mt-4 text-base leading-relaxed text-snow/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark font-display text-sm font-bold text-ink">
                    {t.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((n) => n[0] ?? "")
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-mist">{t.role}</p>
                  </div>
                </div>
                <Stars rating={t.rating} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <CtaBand
        title={cta.title ?? undefined}
        description={cta.body ?? undefined}
        phone={site.phone}
        phoneHref={site.phoneHref}
      />
    </>
  );
}
