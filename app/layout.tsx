import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { metadataBaseUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "King of Shades — Premium Window Tinting & Custom Vinyl",
    template: "%s | King of Shades",
  },
  description:
    "Window tinting for cars, homes, and commercial properties in Brigantine and South Jersey, plus custom vinyl. Heat rejection, UV protection, and a lifetime workmanship warranty.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  keywords: [
    "window tinting",
    "home window tint",
    "commercial window tint",
    "automotive window tint",
    "ceramic tint",
    "residential window film",
    "custom decals",
    "vinyl graphics",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-snow">{children}</body>
    </html>
  );
}
