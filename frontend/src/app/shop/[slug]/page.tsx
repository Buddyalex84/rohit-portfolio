import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SuitTypePicker } from "@/components/shop/SuitTypePicker";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ suit?: string }>;
}) {
  const { slug } = await params;
  const { suit } = await searchParams;
  let category;
  try {
    category = await api.category(slug);
  } catch {
    notFound();
  }

  const query = suit ? `?category__slug=${slug}&suit_type__slug=${suit}` : `?category__slug=${slug}`;
  const products = await api.products(query).catch(() => []);
  const activeSuit = category.suit_types.find((item) => item.slug === suit);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <nav className="text-sm text-muted">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{category.name}</span>
        {activeSuit ? (
          <>
            <span className="mx-2">/</span>
            <span className="text-charcoal">{activeSuit.name}</span>
          </>
        ) : null}
      </nav>
      <h1 className="mt-4 font-serif text-5xl">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">{category.description}</p>

      {category.supports_suit_types ? (
        <SuitTypePicker categorySlug={category.slug} types={category.suit_types} active={suit} />
      ) : null}

      <ProductGrid products={products} categorySlug={category.slug} />
    </div>
  );
}
