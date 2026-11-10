import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  let categories: Awaited<ReturnType<typeof api.categories>> = [];
  try {
    categories = await api.categories();
  } catch {
    categories = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs tracking-[0.28em] text-gold uppercase">Collection</p>
      <h1 className="mt-2 font-serif text-5xl">Shop Our Collection</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Explore a wide range of custom tailored clothing for every occasion. Each category leads to garments you
        can review and customize.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article key={category.slug} className="flex flex-col border border-charcoal/10 bg-white">
            <Link href={`/shop/${category.slug}`} className="aspect-[5/4] overflow-hidden">
              {category.image ? (
                <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-ivory-deep">{category.name}</div>
              )}
            </Link>
            <div className="flex flex-1 flex-col px-6 py-6">
              <h2 className="font-serif text-2xl">{category.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{category.tagline || category.description}</p>
              <div className="mt-6 flex gap-3">
                <Button href={`/shop/${category.slug}`} variant="ghost">
                  View Collection
                </Button>
                <Button href={`/customize?category=${category.slug}`} variant="navy">
                  Customize
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
