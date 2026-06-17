import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Field";
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
              Sign in to manage bookings, customers, and more.
            </p>
          </div>

          <form className="mt-8 space-y-5">
            <Field label="Email address" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kingofshades.com"
                  defaultValue="admin@kingofshades.com"
                  className="pl-10"
                />
              </div>
            </Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-gold hover:text-gold-light">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  defaultValue="demo-password"
                  className="pl-10"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-mist">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-line bg-charcoal-light accent-gold"
              />
              Keep me signed in
            </label>

            {/* No real auth — links straight to the dashboard mockup */}
            <Button href="/admin" size="lg" className="w-full">
              Sign in to Dashboard
            </Button>
          </form>

          <p className="mt-6 rounded-xl border border-line bg-charcoal-light px-4 py-3 text-center text-xs text-mist">
            Prototype only — authentication is not implemented. Any sign-in opens
            the dashboard.
          </p>
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
