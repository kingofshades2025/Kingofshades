import { Phone } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CtaBand({
  title = "Ready to upgrade your shade?",
  description = "Book your appointment online or request a free, no-obligation quote. Most vehicles done same day.",
  phone,
  phoneHref,
}: {
  title?: string;
  description?: string;
  phone?: string;
  phoneHref?: string;
}) {
  const displayPhone = phone ?? site.phone;
  const displayPhoneHref = phoneHref ?? site.phoneHref;
  return (
    <section className="py-16">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-charcoal-light via-charcoal to-ink px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-mist sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/booking" size="lg">
                Book Appointment
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Get a Free Quote
              </Button>
              <a
                href={displayPhoneHref}
                className="inline-flex items-center gap-2 px-4 text-sm font-medium text-snow/80 transition-colors hover:text-gold"
              >
                <Phone className="h-4 w-4 text-gold" />
                {displayPhone}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
