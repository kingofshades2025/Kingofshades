import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing use of the ${site.name} website and services.`,
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      description={`By using ${site.domain} or booking with ${site.name}, you agree to these terms.`}
      updated="August 10, 2026"
    >
      <LegalSection title="Services">
        <p>
          {site.name} offers window tinting, vinyl/decal work, and related
          services. Descriptions on this website are for general information.
          Final scope, film selection, pricing, and timing are confirmed when we
          accept your booking or quote.
        </p>
      </LegalSection>

      <LegalSection title="Appointments & quotes">
        <p>
          Online booking and quote requests are requests, not guaranteed
          reservations, until we confirm. We may contact you to adjust time,
          service details, or pricing based on vehicle/property condition or
          film availability. Cancellations or reschedules should be made as
          early as possible using the contact details on our site.
        </p>
      </LegalSection>

      <LegalSection title="Pricing & payment">
        <p>
          Prices shown online may be estimates or starting rates. Applicable
          taxes, add-ons, and deposits (if any) will be communicated before work
          begins. Payments processed through third-party providers are subject
          to those providers&apos; terms.
        </p>
      </LegalSection>

      <LegalSection title="Workmanship & warranty">
        <p>
          We stand behind our install quality as described at the time of
          service. Warranty coverage depends on the film and service purchased
          and excludes damage from misuse, improper care during curing,
          accidents, or third-party alterations. Follow the care instructions we
          provide after install.
        </p>
      </LegalSection>

      <LegalSection title="Customer responsibilities">
        <p>
          You agree to provide accurate contact and vehicle/property
          information, arrive (or make the site accessible) as scheduled, and
          follow curing and care guidance. Vehicles or surfaces must be in a
          condition suitable for professional film installation.
        </p>
      </LegalSection>

      <LegalSection title="Website use">
        <p>
          You may not misuse the site (including attempting to disrupt
          security, scrape content at scale, or submit fraudulent bookings). We
          may suspend access that appears abusive or unlawful.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {site.name} is not liable for
          indirect, incidental, or consequential damages arising from use of the
          website or services. Our total liability for any claim related to a
          specific job is limited to the amount you paid us for that job.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms:{" "}
          <a className="text-gold hover:underline" href={site.emailHref}>
            {site.email}
          </a>{" "}
          ·{" "}
          <a className="text-gold hover:underline" href={site.phoneHref}>
            {site.phone}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
