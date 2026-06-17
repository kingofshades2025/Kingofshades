import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { mainNav, site } from "@/lib/site";
import { services } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function Footer() {
  return (
    <footer className="border-t border-line bg-charcoal">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
              Premium automotive, residential, and commercial window tinting plus
              custom decals and vinyl graphics — installed by certified pros and
              backed for life.
            </p>
            <div className="mt-6 flex gap-2.5">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-charcoal-light text-snow/70 transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <SocialIcon name={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-mist transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">
              Services
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services#${s.slug}`}
                    className="text-mist transition-colors hover:text-gold"
                  >
                    {s.title.replace(" Window Tinting", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">
              Get in Touch
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-start gap-3 text-mist transition-colors hover:text-gold"
                >
                  <Phone className="mt-0.5 h-4 w-4 text-gold" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.emailHref}
                  className="flex items-start gap-3 text-mist transition-colors hover:text-gold"
                >
                  <Mail className="mt-0.5 h-4 w-4 text-gold" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-mist">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-mist sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-gold">
              Terms of Service
            </Link>
            <Link href="/admin/login" className="transition-colors hover:text-gold">
              Admin
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
