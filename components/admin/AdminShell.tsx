"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Tag,
  Image as ImageIcon,
  CreditCard,
  Settings,
  MessageSquareQuote,
  FilePenLine,
  Menu,
  X,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { adminNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { signOut } from "@/lib/auth/admin";

const icons = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  users: Users,
  tag: Tag,
  image: ImageIcon,
  card: CreditCard,
  settings: Settings,
  quote: MessageSquareQuote,
  edit: FilePenLine,
} as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {adminNav.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons];
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold/12 text-gold"
                : "text-snow/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-line p-3">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-snow/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        View website
      </Link>
      <LogoutButton />
    </div>
  );
}

function TopbarMenu({
  open,
  align,
  children,
}: {
  open: boolean;
  align: "left" | "right";
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        "absolute top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-charcoal shadow-xl",
        align === "right" ? "right-0" : "left-0",
      )}
    >
      {children}
    </div>
  );
}

export function AdminShell({
  children,
  pendingCount = 0,
}: {
  children: React.ReactNode;
  pendingCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current?.contains(target)) return;
      if (profileRef.current?.contains(target)) return;
      setNotificationsOpen(false);
      setProfileOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen, profileOpen]);

  return (
    <div className="min-h-screen bg-ink lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-charcoal lg:flex">
        <div className="flex h-18 items-center border-b border-line px-5">
          <Logo />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <NavLinks />
          <SidebarFooter />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-charcoal">
            <div className="flex h-18 items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-snow"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
              <SidebarFooter />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-18 items-center gap-4 border-b border-line bg-ink/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-snow lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              placeholder="Search appointments, customers…"
              className="w-full rounded-xl border border-line bg-charcoal-light py-2.5 pl-10 pr-4 text-sm text-snow placeholder:text-mist/70 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setProfileOpen(false);
                  setNotificationsOpen((value) => !value);
                }}
                className={cn(
                  "relative grid h-10 w-10 place-items-center rounded-xl border border-line text-snow/80 hover:text-gold",
                  notificationsOpen && "border-gold/40 text-gold",
                )}
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-ink" />
                )}
              </button>

              <TopbarMenu open={notificationsOpen} align="right">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>
                {pendingCount > 0 ? (
                  <div className="p-2">
                    <Link
                      href="/admin/appointments"
                      role="menuitem"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                    >
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>
                        <span className="block font-medium text-white">
                          {pendingCount} upcoming appointment{pendingCount === 1 ? "" : "s"}
                        </span>
                        <span className="mt-0.5 block text-xs text-mist">
                          View requests and confirmed bookings
                        </span>
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-mist">No new notifications</p>
                    <Link
                      href="/admin/appointments"
                      role="menuitem"
                      onClick={() => setNotificationsOpen(false)}
                      className="mt-3 inline-block text-xs font-medium text-gold hover:text-gold-light"
                    >
                      View appointments
                    </Link>
                  </div>
                )}
              </TopbarMenu>
            </div>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setNotificationsOpen(false);
                  setProfileOpen((value) => !value);
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border border-line bg-charcoal-light py-1.5 pl-1.5 pr-3 text-left hover:border-gold/30",
                  profileOpen && "border-gold/40",
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-sm font-bold text-ink">
                  KS
                </span>
                <span className="hidden sm:block">
                  <span className="block text-sm font-medium leading-tight text-white">
                    Admin
                  </span>
                  <span className="block text-xs leading-tight text-mist">
                    Manager
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 text-mist transition-transform sm:block",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>

              <TopbarMenu open={profileOpen} align="right">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold text-white">Admin Manager</p>
                  <p className="mt-0.5 text-xs text-mist">King of Shades admin panel</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-snow/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View website
                  </Link>
                  <Link
                    href="/admin/settings"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-snow/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      void signOut();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-snow/80 transition-colors hover:bg-white/5 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </TopbarMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
