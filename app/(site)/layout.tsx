import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings, getContentSections, getServices } from "@/lib/queries/public";
import { toSiteConfig } from "@/lib/site-config";
import { getSection, mergeContentSections } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let sections = mergeContentSections([]);
  let services = await getServices().catch(() => []);

  try {
    [settings, sections, services] = await Promise.all([
      getSiteSettings(),
      getContentSections(),
      getServices(),
    ]);
  } catch (err) {
    console.error("[site layout]", err);
  }

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
