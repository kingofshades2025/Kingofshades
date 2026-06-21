import Link from "next/link";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export default function PortalLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-white">Customer portal</h1>
      <p className="mt-2 text-sm text-mist">Sign in with your email to view appointments and quotes.</p>
      <PortalLoginForm />
      <Link href="/" className="mt-6 text-center text-sm text-gold hover:text-gold-light">← Back to website</Link>
    </div>
  );
}
