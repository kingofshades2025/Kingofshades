import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 60%)",
        }}
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-line bg-surface/80 p-8 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-white">
              Admin Portal
            </h1>
            <p className="mt-1 text-sm text-mist">
              Sign in to manage bookings, customers, and content.
            </p>
          </div>

          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
