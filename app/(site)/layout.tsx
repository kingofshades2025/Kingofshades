import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings, getContentSections, getServices } from "@/lib/queries/public";
import { toSiteConfig } from "@/lib/site-config";
import { getSection } from "@/lib/cms";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, sections, services] = await Promise.all([
    getSiteSettings(),
    getContentSections(),
    getServices(),
  ]);
  const site = toSiteConfig(settings);
  const footerTagline = getSection(sections, "footer_tagline").body ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar site={site} />
      <main className="flex-1">{children}</main>
      <Footer site={site} tagline={footerTagline} services={services} />
    </div>
  );
}
