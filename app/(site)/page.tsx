import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Gem,
  Clock,
  Sparkles,
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
import { getSection, sectionMeta, getBeforeAfterCards } from "@/lib/cms";
import { toLegacyService, toLegacyTestimonial } from "@/lib/adapters";
import { toSiteConfig } from "@/lib/site-config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  const heroCardLeft = getSection(sections, "hero_card_left");
  const heroCardRight = getSection(sections, "hero_card_right");
  const beforeAfterCards = getBeforeAfterCards(sections);

  const services = dbServices.length
    ? dbServices.slice(0, 4).map(toLegacyService)
    : mockServices;
  const testimonials = dbTestimonials.length
    ? dbTestimonials.map(toLegacyTestimonial)
    : mockTestimonials;

  const heroBadge = getSection(sections, "hero_badge").title ?? "";
  const heroTitle = getSection(sections, "hero_title").title ?? "";
  const heroHighlight = sectionMeta(sections, "hero_title", "highlight", "Window Tinting");
  const heroSubtitle = getSection(sections, "hero_subtitle").body ?? "";
  const aboutBullets = sectionMeta<string[]>(sections, "about_section", "bullets", []);

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-44">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 70% 0%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(60% 50% at 0% 30%, rgba(42,91,215,0.10) 0%, transparent 55%)",
          }}
        />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <Badge tone="gold">
                <Sparkles className="h-3.5 w-3.5" />
                {heroBadge}
              </Badge>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
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
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/booking" size="lg">Book Appointment</Button>
                <Button href="/contact" variant="outline" size="lg">Get a Quote</Button>
                <Button href="/services" variant="ghost" size="lg">
                  View Services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-display text-2xl font-bold text-white">{s.value}</dt>
                    <dd className="mt-1 text-xs uppercase tracking-wider text-mist">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative animate-fade-up [animation-delay:120ms]">
              <TintGlass
                hue={210}
                className="aspect-[4/3] shadow-2xl"
                badge={String(sectionMeta(sections, "hero_visual", "badge", "Ceramic 20%"))}
                label={heroVisual.title ?? ""}
                sublabel={heroVisual.body ?? ""}
              />
              <Card className="absolute -bottom-6 -left-6 hidden w-56 p-4 sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold">
                    <Snowflake className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{heroCardLeft.title}</p>
                    <p className="text-xs text-mist">{heroCardLeft.body}</p>
                  </div>
                </div>
              </Card>
              <Card className="absolute -right-4 top-8 hidden w-44 p-4 sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{heroCardRight.title}</p>
                    <p className="text-xs text-mist">{heroCardRight.body}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <div className="border-y border-line bg-charcoal/60">
        <Container className="grid grid-cols-2 divide-line py-6 sm:grid-cols-4 sm:divide-x">
          {featureStrip.map(({ icon, label }) => {
            const Icon = stripIcons[icon as keyof typeof stripIcons] ?? ShieldCheck;
            return (
              <div key={label} className="flex items-center justify-center gap-3 py-3 sm:py-0">
                <Icon className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-snow/85">{label}</span>
              </div>
            );
          })}
        </Container>
      </div>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <TintGlass
              hue={280}
              className="aspect-[5/4]"
              label={String(sectionMeta(sections, "about_section", "visual_label", ""))}
              sublabel={String(sectionMeta(sections, "about_section", "visual_sublabel", ""))}
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
                    {t.name.split(" ").map((n) => n[0]).join("")}
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
