import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

const WORKSHOP =
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80";

export default function AboutPage() {
  return (
    <div>
      <section className="relative min-h-[46vh]">
        <img src={WORKSHOP} alt="Tailor at work" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative mx-auto flex min-h-[46vh] max-w-6xl items-end px-5 py-16">
          <div>
            <p className="text-xs tracking-[0.28em] text-gold uppercase">The house</p>
            <h1 className="mt-2 font-serif text-5xl text-ivory md:text-6xl">
              40+ Years of Tailoring Excellence
            </h1>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-lg leading-relaxed text-ink">
          At Darjee, tailoring is more than stitching fabric together. It is the art of creating garments that
          reflect individuality, confidence, and personal style.
        </p>
        <p className="mt-6 leading-relaxed text-muted">
          With over 40 years of tailoring experience, our approach combines traditional craftsmanship with modern
          design preferences. From everyday shirts and trousers to wedding sherwanis and tailored suits, every
          garment receives careful attention to fit, fabric, and finishing.
        </p>
        <p className="mt-6 leading-relaxed text-muted">
          Our goal is to make personalized tailoring convenient and transparent, allowing every customer to
          communicate their preferences and work with our tailoring team to create garments made for them.
        </p>
      </section>
      <section className="bg-white/70 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
          {[
            ["Craftsmanship", "Traditional cutting, measured stitching, and considered finishing."],
            ["Fit process", "Standard sizes or full measurements, with in-person consultation when requested."],
            ["Customer-focused service", "Each request is reviewed before production. Nothing is assumed from a clothing size alone."],
          ].map(([title, copy]) => (
            <article key={title} className="border border-charcoal/10 px-6 py-8">
              <h2 className="font-serif text-2xl">{title}</h2>
              <p className="mt-3 text-sm text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="py-16 text-center">
        <Button href="/customize">Start Customizing</Button>
      </div>
    </div>
  );
}
