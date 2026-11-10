import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Ruler, Scissors, Sparkles, Clock, Shirt } from "lucide-react";
import Link from "next/link";

const HERO =
  "https://images.unsplash.com/photo-1594938298603-c8148c6bcd4d?auto=format&fit=crop&w=1800&q=80";
const CRAFT = [
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
];

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof api.categories>> = [];
  try {
    categories = await api.categories();
  } catch {
    categories = [];
  }

  return (
    <div>
      <section className="relative min-h-[86vh] overflow-hidden">
        <img src={HERO} alt="Tailored navy suit" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy/55 to-transparent" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-5 py-24">
          <p className="mb-4 text-xs tracking-[0.32em] text-gold uppercase">Bespoke tailoring</p>
          <h1 className="max-w-xl font-serif text-5xl text-ivory md:text-7xl">
            Crafted for You.
            <br />
            Tailored to Perfection.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/80">
            Discover the art of bespoke tailoring with Darjee. From everyday essentials to distinguished
            occasion wear, every garment is designed around your measurements, preferences, and personal style.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/customize" variant="gold">
              Customize Your Outfit
            </Button>
            <Button href="/shop" variant="light">
              Explore Collection
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-4">
        {[
          { icon: Clock, label: "40+ years of experience" },
          { icon: Shirt, label: "Premium fabrics" },
          { icon: Ruler, label: "Perfect fitting" },
          { icon: Sparkles, label: "Personalized designs" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border border-charcoal/10 bg-white/50 px-4 py-5">
            <item.icon className="h-5 w-5 text-gold" />
            <p className="text-sm tracking-wide">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.28em] text-gold uppercase">The atelier</p>
          <h2 className="mt-2 font-serif text-4xl">Our Collection</h2>
        </div>
        {categories.length === 0 ? (
          <p className="text-center text-muted">
            The catalog will appear once the API is running. Start the Django server and seed the database.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop/${category.slug}`}
                className="group overflow-hidden border border-charcoal/10 bg-white"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-ivory-deep text-muted">
                      {category.name}
                    </div>
                  )}
                </div>
                <div className="px-4 py-5 text-center">
                  <h3 className="font-serif text-xl">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted">{category.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-serif text-4xl">Why Choose Darjee?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Over 40 years of tailoring experience", "A practiced eye for cloth, proportion, and finishing."],
              ["Personalized garment fitting", "Every order is drafted around your measurements or a consultation."],
              ["Customer-selected fabrics and designs", "Choose cloth, color, and construction details with our team."],
              ["Traditional craftsmanship with contemporary styling", "Classic methods, current silhouettes."],
              ["Individual attention to every order", "A specialist reviews each request before production begins."],
            ].map(([title, copy]) => (
              <article key={title} className="border border-charcoal/10 bg-ivory px-6 py-8">
                <Scissors className="mb-4 h-5 w-5 text-gold" />
                <h3 className="font-serif text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center font-serif text-4xl">How It Works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-5">
          {[
            "Choose your garment.",
            "Select your design and fit.",
            "Provide measurements or book a measurement consultation.",
            "Review your design and submit your request.",
            "Our tailoring team confirms the details and production timeline.",
          ].map((step, index) => (
            <li key={step} className="border-t border-gold pt-4">
              <p className="text-xs tracking-[0.2em] text-gold uppercase">0{index + 1}</p>
              <p className="mt-3 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-navy py-20 text-ivory">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-serif text-4xl">Craftsmanship</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-ivory/70">
            Cutting, stitching, and finishing — the quiet work that gives a garment its presence.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CRAFT.map((src) => (
              <img key={src} src={src} alt="Tailoring process" className="h-72 w-full object-cover" />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <img src={CRAFT[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-serif text-4xl md:text-5xl">Your Style. Your Measurements. Your Darjee.</h2>
          <div className="mt-8">
            <Button href="/customize">Start Customizing</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
