"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { mainNav } from "@/lib/site";
import type { SiteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Navbar({ site }: { site: SiteConfig }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent",
      )}
    >
      <Container>
        <nav className="flex h-18 items-center justify-between py-3">
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-gold"
                    : "text-snow/75 hover:text-white",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-snow/80 transition-colors hover:text-gold"
            >
              <Phone className="h-4 w-4 text-gold" />
              {site.phone}
            </a>
            <Button href="/booking" size="sm">
              Book Now
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))}
            className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-charcoal-light text-snow lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 top-18 z-40 bg-ink/95 backdrop-blur-xl transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        >
          <Container className="flex h-full flex-col py-8">
            <div className="flex flex-col gap-1">
              {mainNav.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
                  className={cn(
                    "rounded-xl border border-line/60 px-5 py-4 text-lg font-medium transition-all",
                    isActive(item.href)
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "text-snow hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-line pt-8">
              <Button href="/booking" size="lg" className="w-full">
                Book Appointment
              </Button>
              <Button href="/contact" variant="outline" size="lg" className="w-full">
                Get a Quote
              </Button>
              <a
                href={site.phoneHref}
                className="flex items-center justify-center gap-2 pt-2 text-base font-medium text-snow/80"
              >
                <Phone className="h-4 w-4 text-gold" />
                {site.phone}
              </a>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
