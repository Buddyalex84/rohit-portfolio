import type { SiteSettings } from "@/lib/types";
import Link from "next/link";
import { Logo } from "../brand/Logo";

export function Footer({ site }: { site: SiteSettings }) {
  return (
    <footer className="mt-20 border-t border-charcoal/10 bg-navy text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm text-ivory/70">
            Premium bespoke tailoring. Personalized clothing, expert craftsmanship, and timeless style.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-xs tracking-[0.2em] uppercase text-gold">Navigate</h3>
          <ul className="space-y-2 text-sm text-ivory/80">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/customize">Customize</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs tracking-[0.2em] uppercase text-gold">Atelier</h3>
          <ul className="space-y-2 text-sm text-ivory/80">
            {site.address ? <li className="whitespace-pre-line">{site.address}</li> : <li>Address available from the atelier.</li>}
            {site.hours ? <li>{site.hours}</li> : <li>Hours confirmed on enquiry.</li>}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs tracking-[0.2em] uppercase text-gold">Contact</h3>
          <ul className="space-y-2 text-sm text-ivory/80">
            {site.phone ? (
              <li>
                <a href={`tel:${site.phone}`}>Call {site.phone}</a>
              </li>
            ) : (
              <li>Phone number configured in admin.</li>
            )}
            {site.whatsapp ? (
              <li>
                <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            ) : null}
            {site.email ? (
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            ) : null}
            {site.instagram_url ? (
              <li>
                <a href={site.instagram_url} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            ) : null}
            {site.facebook_url ? (
              <li>
                <a href={site.facebook_url} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-4 text-center text-xs tracking-[0.16em] uppercase text-ivory/50">
        Darjee · Bespoke tailoring
      </div>
    </footer>
  );
}
