import { QuoteRequestForm } from "@/components/quotes/QuoteRequestForm";

export default function QuotePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Custom Quote</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Request a free estimate</h1>
        <p className="mt-3 text-mist">Every project is different. Tell us what you need and we&apos;ll send a tailored quote.</p>
      </div>
      <QuoteRequestForm />
    </section>
  );
}
