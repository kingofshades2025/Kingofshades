import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses, and protects your information.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      description={`This policy explains how ${site.name} handles information when you use ${site.domain}, book appointments, or contact us.`}
      updated="August 10, 2026"
    >
      <LegalSection title="Who we are">
        <p>
          {site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) provides automotive,
          residential, and commercial window tinting and related services in New
          Jersey. Contact us at{" "}
          <a className="text-gold hover:underline" href={site.emailHref}>
            {site.email}
          </a>{" "}
          or{" "}
          <a className="text-gold hover:underline" href={site.phoneHref}>
            {site.phone}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We may collect:</p>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Contact details you submit (name, email, phone, address).</li>
          <li>
            Booking and quote details (vehicle or property info, preferred
            service, photos you upload, notes).
          </li>
          <li>
            Payment-related information processed by our payment provider
            (we do not store full card numbers on our servers).
          </li>
          <li>
            Basic technical data such as browser type and pages visited, used to
            operate and improve the site.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Respond to inquiries and provide quotes.</li>
          <li>Schedule, confirm, and fulfill appointments.</li>
          <li>Process payments and send related receipts or notices.</li>
          <li>Improve our website, services, and customer experience.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          We do not sell your personal information. We may share data with
          service providers who help us operate (for example hosting, email,
          scheduling, and payment processing), only as needed to provide those
          services, or when required by law.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We keep booking, quote, and customer records as long as needed for
          business operations, warranty support, accounting, and legal
          requirements, then delete or anonymize them when no longer needed.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may request access to, correction of, or deletion of personal
          information we hold about you by emailing{" "}
          <a className="text-gold hover:underline" href={site.emailHref}>
            {site.email}
          </a>
          , subject to applicable law and legitimate business needs (such as
          completed transaction records).
        </p>
      </LegalSection>

      <LegalSection title="Updates">
        <p>
          We may update this policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page reflects the latest
          revision.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
