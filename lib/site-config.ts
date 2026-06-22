import { site as staticSite } from "@/lib/site";
import type { SiteSettings } from "@/lib/types/database";

export type SiteConfig = {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  domain: string;
  url: string;
  address: { line1: string; line2: string };
  hours: { day: string; time: string }[];
  socials: { label: string; href: string; icon: string }[];
};

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.startsWith("1") ? digits : `1${digits}`}` : staticSite.phoneHref;
}

export function getBusinessAddressLines(settings?: SiteSettings | null) {
  const { address } = toSiteConfig(settings);
  return {
    line1: address.line1.trim() || staticSite.address.line1,
    line2: address.line2.trim() || staticSite.address.line2,
  };
}

export function toSiteConfig(settings?: SiteSettings | null): SiteConfig {
  const phone = settings?.phone ?? staticSite.phone;
  const email = settings?.email ?? staticSite.email;

  return {
    name: settings?.business_name ?? staticSite.name,
    shortName: staticSite.shortName,
    tagline: staticSite.tagline,
    phone,
    phoneHref: phoneHref(phone),
    email,
    emailHref: `mailto:${email}`,
    domain: staticSite.domain,
    url: staticSite.url,
    address: {
      line1: settings?.address_line1 ?? staticSite.address.line1,
      line2: settings?.address_line2 ?? staticSite.address.line2,
    },
    hours:
      settings?.business_hours?.length ? settings.business_hours : [...staticSite.hours],
    socials:
      settings?.social_links?.length ? settings.social_links : [...staticSite.socials],
  };
}
