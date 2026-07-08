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

const mobileNav = mainNav.filter((item) => item.href !== "/booking");

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
    if (!open) return;

    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const closeMenu = () => setMenuPath(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[110] transition-all duration-300",
          open || scrolled
            ? "border-b border-line bg-ink"
            : "border-b border-transparent bg-gradient-to-b from-black/80 to-transparent",
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
              aria-expanded={open}
              onClick={() =>
                setMenuPath((current) => (current === pathname ? null : pathname))
              }
              className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-charcoal-light text-snow lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile menu — solid full-screen overlay below header */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-18 z-[100] bg-ink transition-all duration-300 ease-out lg:hidden",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-2 opacity-0",
        )}
      >
        <Container className="flex h-full flex-col overflow-y-auto overscroll-contain py-6">
          <nav className="flex flex-col gap-2">
            {mobileNav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                className={cn(
                  "min-h-12 rounded-xl px-5 py-3.5 text-lg font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-gold/10 text-gold"
                    : "text-snow hover:bg-charcoal-light",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-line pt-6">
            <Button href="/booking" size="lg" className="w-full" onClick={closeMenu}>
              Book Appointment
            </Button>
            <Button
              href="/contact"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={closeMenu}
            >
              Get a Quote
            </Button>
            <a
              href={site.phoneHref}
              className="flex min-h-12 items-center justify-center gap-2 text-base font-medium text-snow/80"
            >
              <Phone className="h-4 w-4 text-gold" />
              {site.phone}
            </a>
          </div>
        </Container>
      </div>
    </>
  );
}
