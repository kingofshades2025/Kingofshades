import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Navigation } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialIcon } from "@/components/ui/SocialIcon";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with King of Shades for a free quote, business hours, and location details.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Let's talk shade"
        description="Questions, quotes, or fleet inquiries — reach out and our team will get right back to you."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Form */}
            <Card className="p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-white">
                Send us a message
              </h2>
              <p className="mt-1 text-sm text-mist">
                Fill out the form and we&apos;ll respond within one business hour.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>

            {/* Info */}
            <div className="space-y-5">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  Get in touch
                </h3>
                <ul className="mt-4 space-y-4 text-sm">
                  <li>
                    <a
                      href={site.phoneHref}
                      className="flex items-start gap-3 text-snow/85 transition-colors hover:text-gold"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                        <Phone className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-wider text-mist">
                          Phone
                        </span>
                        {site.phone}
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={site.emailHref}
                      className="flex items-start gap-3 text-snow/85 transition-colors hover:text-gold"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                        <Mail className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-wider text-mist">
                          Email
                        </span>
                        {site.email}
                      </span>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-snow/85">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-wider text-mist">
                        Location
                      </span>
                      {site.address.line1}
                      <br />
                      {site.address.line2}
                    </span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <Clock className="h-5 w-5 text-gold" />
                  Business hours
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {site.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex items-center justify-between border-b border-line/60 pb-2.5 last:border-0 last:pb-0"
                    >
                      <span className="text-mist">{h.day}</span>
                      <span className="font-medium text-snow">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  Follow us
                </h3>
                <div className="mt-4 flex gap-2.5">
                  {site.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-charcoal-light text-snow/70 transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      <SocialIcon name={s.icon} />
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-10">
            <div className="relative h-80 overflow-hidden rounded-3xl border border-line">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #141414 0%, #0c0c0c 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(212,175,55,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.10) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              {/* fake roads */}
              <div className="absolute left-0 top-1/3 h-1.5 w-full -rotate-3 bg-white/5" />
              <div className="absolute left-1/4 top-0 h-full w-1.5 bg-white/5" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-ink/80 text-gold shadow-glow">
                  <Navigation className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-white">
                  {site.name}
                </p>
                <p className="text-sm text-mist">
                  {site.address.line1}, {site.address.line2}
                </p>
                <span className="mt-3 rounded-full border border-line bg-charcoal-light px-3 py-1 text-xs text-mist">
                  Interactive map placeholder — Phase 2
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
