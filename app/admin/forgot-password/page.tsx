import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-line bg-surface/80 p-8">
          <h1 className="text-center font-display text-2xl font-bold text-white">
            Reset password
          </h1>
          <p className="mt-1 text-center text-sm text-mist">
            Enter your admin email and we&apos;ll send a reset link.
          </p>
          <ForgotPasswordForm />
        </div>
        <div className="mt-6 text-center">
          <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-gold">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
