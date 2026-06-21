import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo />
          <Link href="/booking" className="text-sm text-gold hover:text-gold-light">Book appointment</Link>
        </div>
      </header>
      {children}
    </div>
  );
}
