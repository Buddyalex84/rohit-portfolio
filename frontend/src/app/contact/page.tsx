import { ContactForm } from "@/components/contact/ContactForm";
import { api } from "@/lib/api";
import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const site = await api.site().catch(() => null);
  const phone = site?.phone;
  const whatsapp = site?.whatsapp?.replace(/\D/g, "");
  const email = site?.email;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-2">
      <div>
        <p className="text-xs tracking-[0.28em] text-gold uppercase">Atelier</p>
        <h1 className="mt-2 font-serif text-5xl">Get in Touch</h1>
        <p className="mt-4 text-muted">
          Call, write, or send a message. Consultation requests are confirmed before they are treated as bookings.
        </p>
        <div className="mt-8 space-y-4">
          {phone ? (
            <a className="flex items-center gap-3 border border-charcoal/10 bg-white px-5 py-4" href={`tel:${phone}`}>
              <Phone className="h-4 w-4 text-gold" /> Call {phone}
            </a>
          ) : (
            <p className="text-sm text-muted">A public phone number has not been configured yet.</p>
          )}
          {whatsapp ? (
            <a
              className="flex items-center gap-3 border border-charcoal/10 bg-white px-5 py-4"
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4 text-gold" /> Chat on WhatsApp
            </a>
          ) : null}
          {email ? (
            <a className="flex items-center gap-3 border border-charcoal/10 bg-white px-5 py-4" href={`mailto:${email}`}>
              <Mail className="h-4 w-4 text-gold" /> {email}
            </a>
          ) : null}
        </div>
        <div className="mt-8 text-sm text-muted">
          {site?.address ? <p className="whitespace-pre-line">{site.address}</p> : <p>Studio address is available on request.</p>}
          {site?.hours ? <p className="mt-2">{site.hours}</p> : null}
        </div>
        {site?.map_embed_url ? (
          <iframe title="Map" src={site.map_embed_url} className="mt-6 h-64 w-full border-0" />
        ) : null}
      </div>
      <ContactForm />
    </div>
  );
}
