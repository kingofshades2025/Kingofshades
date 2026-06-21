"use client";

import type { ContentSection } from "@/lib/types/database";
import {
  mergeContentSections,
  getSection,
  sectionMeta,
  getStats,
  getFeatureStrip,
  getWhyChoose,
  getProcessSteps,
  getBeforeAfterCards,
  statsToLines,
  linesToStats,
  featureStripToLines,
  linesToFeatureStrip,
  whyChooseToLines,
  linesToWhyChoose,
  processStepsToLines,
  linesToProcessSteps,
  cardsToLines,
  linesToCards,
  listToLines,
  linesToList,
} from "@/lib/cms";
import { ContentSectionForm } from "@/components/admin/ContentSectionForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function ContentManager({ sections: rawSections }: { sections: ContentSection[] }) {
  const sections = mergeContentSections(rawSections);

  const heroBadge = getSection(sections, "hero_badge");
  const heroTitle = getSection(sections, "hero_title");
  const heroSubtitle = getSection(sections, "hero_subtitle");
  const heroCardLeft = getSection(sections, "hero_card_left");
  const heroCardRight = getSection(sections, "hero_card_right");
  const heroVisual = getSection(sections, "hero_visual");
  const about = getSection(sections, "about_section");
  const servicesSection = getSection(sections, "services_section");
  const whyChoose = getSection(sections, "why_choose_section");
  const beforeAfter = getSection(sections, "before_after_section");
  const process = getSection(sections, "process_section");
  const testimonials = getSection(sections, "testimonials_section");
  const cta = getSection(sections, "cta_band");
  const ctaGallery = getSection(sections, "cta_band_gallery");
  const footerTagline = getSection(sections, "footer_tagline");
  const pageServices = getSection(sections, "page_services");
  const pageServicesCta = getSection(sections, "page_services_cta");
  const pageGallery = getSection(sections, "page_gallery");
  const pageContact = getSection(sections, "page_contact");
  const pageBooking = getSection(sections, "page_booking");

  return (
    <>
      <AdminPageHeader
        title="Website Content"
        subtitle="Edit all text and sections shown on the public site."
      />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Hero</h2>
          <div className="space-y-4">
            <ContentSectionForm sectionKey="hero_badge" title="Hero badge" defaultTitle={heroBadge.title ?? ""}>
              <Field label="Badge text"><Input name="title" defaultValue={heroBadge.title ?? ""} /></Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="hero_title"
              title="Hero headline"
              defaultTitle={heroTitle.title ?? ""}
              buildMetadata={(fd) => ({ highlight: (fd.get("highlight") as string)?.trim() || "Window Tinting" })}
            >
              <Field label="Headline"><Input name="title" defaultValue={heroTitle.title ?? ""} /></Field>
              <Field label="Highlighted phrase (gold text)"><Input name="highlight" defaultValue={String(sectionMeta(sections, "hero_title", "highlight", "Window Tinting"))} /></Field>
            </ContentSectionForm>

            <ContentSectionForm sectionKey="hero_subtitle" title="Hero subtitle" defaultBody={heroSubtitle.body ?? ""}>
              <Field label="Subtitle"><Textarea name="body" defaultValue={heroSubtitle.body ?? ""} /></Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="hero_visual"
              title="Hero image card"
              defaultTitle={heroVisual.title ?? ""}
              defaultBody={heroVisual.body ?? ""}
              buildMetadata={(fd) => ({
                badge: (fd.get("badge") as string)?.trim() || "Ceramic 20%",
                image_url: (fd.get("image_url") as string)?.trim() || null,
              })}
            >
              <ImageUploadField
                name="image_url"
                label="Hero photo"
                defaultValue={String(sectionMeta(sections, "hero_visual", "image_url", ""))}
                hint="Large image on the right side of the homepage hero."
              />
              <Field label="Badge"><Input name="badge" defaultValue={String(sectionMeta(sections, "hero_visual", "badge", "Ceramic 20%"))} /></Field>
              <Field label="Label"><Input name="title" defaultValue={heroVisual.title ?? ""} /></Field>
              <Field label="Sublabel"><Input name="body" defaultValue={heroVisual.body ?? ""} /></Field>
            </ContentSectionForm>

            <div className="grid gap-4 lg:grid-cols-2">
              <ContentSectionForm sectionKey="hero_card_left" title="Hero floating card (left)" defaultTitle={heroCardLeft.title ?? ""} defaultBody={heroCardLeft.body ?? ""}>
                <Field label="Headline"><Input name="title" defaultValue={heroCardLeft.title ?? ""} /></Field>
                <Field label="Subtext"><Input name="body" defaultValue={heroCardLeft.body ?? ""} /></Field>
              </ContentSectionForm>
              <ContentSectionForm sectionKey="hero_card_right" title="Hero floating card (right)" defaultTitle={heroCardRight.title ?? ""} defaultBody={heroCardRight.body ?? ""}>
                <Field label="Headline"><Input name="title" defaultValue={heroCardRight.title ?? ""} /></Field>
                <Field label="Subtext"><Input name="body" defaultValue={heroCardRight.body ?? ""} /></Field>
              </ContentSectionForm>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Stats & features</h2>
          <div className="space-y-4">
            <ContentSectionForm
              sectionKey="homepage_stats"
              title="Hero stats"
              buildMetadata={(fd) => ({ items: linesToStats((fd.get("stats_lines") as string) ?? "") })}
            >
              <Field label="Stats (one per line: Label|Value)">
                <Textarea name="stats_lines" rows={4} defaultValue={statsToLines(getStats(sections))} />
              </Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="feature_strip"
              title="Feature strip"
              buildMetadata={(fd) => ({ items: linesToFeatureStrip((fd.get("feature_lines") as string) ?? "") })}
            >
              <Field label="Features (one per line: Label|icon — sun, snowflake, eye, shield)">
                <Textarea name="feature_lines" rows={4} defaultValue={featureStripToLines(getFeatureStrip(sections))} />
              </Field>
            </ContentSectionForm>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — About</h2>
          <ContentSectionForm
            sectionKey="about_section"
            title="About section"
            defaultTitle={about.title ?? ""}
            defaultBody={about.body ?? ""}
            buildMetadata={(fd) => ({
              eyebrow: (fd.get("eyebrow") as string)?.trim(),
              bullets: linesToList((fd.get("bullets") as string) ?? ""),
              visual_label: (fd.get("visual_label") as string)?.trim(),
              visual_sublabel: (fd.get("visual_sublabel") as string)?.trim(),
              stat_value: (fd.get("stat_value") as string)?.trim(),
              stat_label: (fd.get("stat_label") as string)?.trim(),
              image_url: (fd.get("image_url") as string)?.trim() || null,
            })}
          >
            <ImageUploadField
              name="image_url"
              label="About section photo"
              defaultValue={String(sectionMeta(sections, "about_section", "image_url", ""))}
              hint="Photo on the left in the Who We Are section."
            />
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "about_section", "eyebrow", "Who We Are"))} /></Field>
            <Field label="Heading"><Input name="title" defaultValue={about.title ?? ""} /></Field>
            <Field label="Description"><Textarea name="body" defaultValue={about.body ?? ""} /></Field>
            <Field label="Bullet points (one per line)">
              <Textarea name="bullets" rows={4} defaultValue={listToLines(sectionMeta(sections, "about_section", "bullets", [] as string[]))} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Visual label"><Input name="visual_label" defaultValue={String(sectionMeta(sections, "about_section", "visual_label", ""))} /></Field>
              <Field label="Visual sublabel"><Input name="visual_sublabel" defaultValue={String(sectionMeta(sections, "about_section", "visual_sublabel", ""))} /></Field>
              <Field label="Stat value"><Input name="stat_value" defaultValue={String(sectionMeta(sections, "about_section", "stat_value", ""))} /></Field>
              <Field label="Stat label"><Input name="stat_label" defaultValue={String(sectionMeta(sections, "about_section", "stat_label", ""))} /></Field>
            </div>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Services preview</h2>
          <ContentSectionForm
            sectionKey="services_section"
            title="Services section header"
            defaultTitle={servicesSection.title ?? ""}
            defaultBody={servicesSection.body ?? ""}
            buildMetadata={(fd) => ({ eyebrow: (fd.get("eyebrow") as string)?.trim() })}
          >
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "services_section", "eyebrow", "What We Do"))} /></Field>
            <Field label="Title"><Input name="title" defaultValue={servicesSection.title ?? ""} /></Field>
            <Field label="Description"><Textarea name="body" defaultValue={servicesSection.body ?? ""} /></Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Why choose us</h2>
          <ContentSectionForm
            sectionKey="why_choose_section"
            title="Why choose section"
            defaultTitle={whyChoose.title ?? ""}
            defaultBody={whyChoose.body ?? ""}
            buildMetadata={(fd) => ({
              eyebrow: (fd.get("eyebrow") as string)?.trim(),
              items: linesToWhyChoose((fd.get("items") as string) ?? ""),
            })}
          >
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "why_choose_section", "eyebrow", ""))} /></Field>
            <Field label="Title"><Input name="title" defaultValue={whyChoose.title ?? ""} /></Field>
            <Field label="Description"><Textarea name="body" defaultValue={whyChoose.body ?? ""} /></Field>
            <Field label="Items (one per line: Title|Description|icon — shield, badge, gem, clock)">
              <Textarea name="items" rows={6} defaultValue={whyChooseToLines(getWhyChoose(sections))} />
            </Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Before & after</h2>
          <ContentSectionForm
            sectionKey="before_after_section"
            title="Before & after section"
            defaultTitle={beforeAfter.title ?? ""}
            defaultBody={beforeAfter.body ?? ""}
            buildMetadata={(fd) => ({
              eyebrow: (fd.get("eyebrow") as string)?.trim(),
              slider_label: (fd.get("slider_label") as string)?.trim(),
              cards: linesToCards((fd.get("cards") as string) ?? ""),
              before_image_url: (fd.get("before_image_url") as string)?.trim() || null,
              after_image_url: (fd.get("after_image_url") as string)?.trim() || null,
            })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                name="before_image_url"
                label="Before photo (untinted / glare)"
                defaultValue={String(sectionMeta(sections, "before_after_section", "before_image_url", ""))}
              />
              <ImageUploadField
                name="after_image_url"
                label="After photo (tinted)"
                defaultValue={String(sectionMeta(sections, "before_after_section", "after_image_url", ""))}
              />
            </div>
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "before_after_section", "eyebrow", ""))} /></Field>
            <Field label="Title"><Input name="title" defaultValue={beforeAfter.title ?? ""} /></Field>
            <Field label="Description"><Textarea name="body" defaultValue={beforeAfter.body ?? ""} /></Field>
            <Field label="Slider label"><Input name="slider_label" defaultValue={String(sectionMeta(sections, "before_after_section", "slider_label", ""))} /></Field>
            <Field label="Cards below slider (Title|Text per line)">
              <Textarea name="cards" rows={3} defaultValue={cardsToLines(getBeforeAfterCards(sections))} />
            </Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Process</h2>
          <ContentSectionForm
            sectionKey="process_section"
            title="Process section"
            defaultTitle={process.title ?? ""}
            buildMetadata={(fd) => ({
              eyebrow: (fd.get("eyebrow") as string)?.trim(),
              steps: linesToProcessSteps((fd.get("steps") as string) ?? ""),
            })}
          >
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "process_section", "eyebrow", ""))} /></Field>
            <Field label="Title"><Input name="title" defaultValue={process.title ?? ""} /></Field>
            <Field label="Steps (Step|Title|Description per line)">
              <Textarea name="steps" rows={5} defaultValue={processStepsToLines(getProcessSteps(sections))} />
            </Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Homepage — Testimonials header</h2>
          <ContentSectionForm
            sectionKey="testimonials_section"
            title="Testimonials section header"
            defaultTitle={testimonials.title ?? ""}
            buildMetadata={(fd) => ({ eyebrow: (fd.get("eyebrow") as string)?.trim(), rating_text: (fd.get("rating_text") as string)?.trim() })}
          >
            <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "testimonials_section", "eyebrow", ""))} /></Field>
            <Field label="Title"><Input name="title" defaultValue={testimonials.title ?? ""} /></Field>
            <Field label="Rating line"><Input name="rating_text" defaultValue={String(sectionMeta(sections, "testimonials_section", "rating_text", ""))} /></Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Call-to-action bands</h2>
          <div className="space-y-4">
            <ContentSectionForm sectionKey="cta_band" title="Homepage CTA" defaultTitle={cta.title ?? ""} defaultBody={cta.body ?? ""}>
              <Field label="Title"><Input name="title" defaultValue={cta.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={cta.body ?? ""} /></Field>
            </ContentSectionForm>
            <ContentSectionForm sectionKey="cta_band_gallery" title="Gallery page CTA" defaultTitle={ctaGallery.title ?? ""} defaultBody={ctaGallery.body ?? ""}>
              <Field label="Title"><Input name="title" defaultValue={ctaGallery.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={ctaGallery.body ?? ""} /></Field>
            </ContentSectionForm>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Footer</h2>
          <ContentSectionForm sectionKey="footer_tagline" title="Footer description" defaultBody={footerTagline.body ?? ""}>
            <Field label="Tagline"><Textarea name="body" defaultValue={footerTagline.body ?? ""} /></Field>
          </ContentSectionForm>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Inner pages</h2>
          <div className="space-y-4">
            <ContentSectionForm
              sectionKey="page_services"
              title="Services page header"
              defaultTitle={pageServices.title ?? ""}
              defaultBody={pageServices.body ?? ""}
              buildMetadata={(fd) => ({ eyebrow: (fd.get("eyebrow") as string)?.trim() })}
            >
              <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "page_services", "eyebrow", ""))} /></Field>
              <Field label="Title"><Input name="title" defaultValue={pageServices.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={pageServices.body ?? ""} /></Field>
            </ContentSectionForm>

            <ContentSectionForm sectionKey="page_services_cta" title="Services page CTA" defaultTitle={pageServicesCta.title ?? ""} defaultBody={pageServicesCta.body ?? ""}>
              <Field label="Title"><Input name="title" defaultValue={pageServicesCta.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={pageServicesCta.body ?? ""} /></Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="page_gallery"
              title="Gallery page header"
              defaultTitle={pageGallery.title ?? ""}
              defaultBody={pageGallery.body ?? ""}
              buildMetadata={(fd) => ({ eyebrow: (fd.get("eyebrow") as string)?.trim() })}
            >
              <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "page_gallery", "eyebrow", ""))} /></Field>
              <Field label="Title"><Input name="title" defaultValue={pageGallery.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={pageGallery.body ?? ""} /></Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="page_contact"
              title="Contact page"
              defaultTitle={pageContact.title ?? ""}
              defaultBody={pageContact.body ?? ""}
              buildMetadata={(fd) => ({
                eyebrow: (fd.get("eyebrow") as string)?.trim(),
                form_title: (fd.get("form_title") as string)?.trim(),
                form_subtitle: (fd.get("form_subtitle") as string)?.trim(),
              })}
            >
              <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "page_contact", "eyebrow", ""))} /></Field>
              <Field label="Page title"><Input name="title" defaultValue={pageContact.title ?? ""} /></Field>
              <Field label="Page description"><Textarea name="body" defaultValue={pageContact.body ?? ""} /></Field>
              <Field label="Form heading"><Input name="form_title" defaultValue={String(sectionMeta(sections, "page_contact", "form_title", ""))} /></Field>
              <Field label="Form subtext"><Input name="form_subtitle" defaultValue={String(sectionMeta(sections, "page_contact", "form_subtitle", ""))} /></Field>
            </ContentSectionForm>

            <ContentSectionForm
              sectionKey="page_booking"
              title="Booking page header"
              defaultTitle={pageBooking.title ?? ""}
              defaultBody={pageBooking.body ?? ""}
              buildMetadata={(fd) => ({ eyebrow: (fd.get("eyebrow") as string)?.trim() })}
            >
              <Field label="Eyebrow"><Input name="eyebrow" defaultValue={String(sectionMeta(sections, "page_booking", "eyebrow", ""))} /></Field>
              <Field label="Title"><Input name="title" defaultValue={pageBooking.title ?? ""} /></Field>
              <Field label="Description"><Textarea name="body" defaultValue={pageBooking.body ?? ""} /></Field>
            </ContentSectionForm>
          </div>
        </section>
      </div>
    </>
  );
}
