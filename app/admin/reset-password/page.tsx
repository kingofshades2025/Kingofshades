import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Set New Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-line bg-surface/80 p-8">
          <h1 className="text-center font-display text-2xl font-bold text-white">
            Set new password
          </h1>
          <p className="mt-1 text-center text-sm text-mist">
            Choose a strong password for your admin account.
          </p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
