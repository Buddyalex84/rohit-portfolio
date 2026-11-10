import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-loaded",
});

export const metadata: Metadata = {
  title: {
    default: "Darjee · Tailored to Perfection",
    template: "%s · Darjee",
  },
  description:
    "Premium bespoke tailoring. Customize shirts, trousers, sherwanis, and suits around your measurements and personal style.",
};

async function loadSite() {
  try {
    return await api.site();
  } catch {
    return {
      name: "Darjee",
      tagline: "Tailored to Perfection",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      hours: "",
      map_embed_url: "",
      instagram_url: "",
      facebook_url: "",
      max_upload_mb: 8,
      email_configured: false,
      contact_configured: false,
    };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await loadSite();
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${cormorant.variable} bg-ivory text-charcoal antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer site={site} />
      </body>
    </html>
  );
}
