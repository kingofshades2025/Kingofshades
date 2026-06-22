import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
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
  title: {
    default: "King of Shades — Premium Window Tinting & Custom Vinyl",
    template: "%s | King of Shades",
  },
  description:
    "King of Shades delivers premium automotive, residential, and commercial window tinting plus custom decals and vinyl graphics. Heat rejection, UV protection, privacy, and style.",
  keywords: [
    "window tinting",
    "automotive tint",
    "ceramic tint",
    "residential window film",
    "commercial window tint",
    "custom decals",
    "vinyl graphics",
  ],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
