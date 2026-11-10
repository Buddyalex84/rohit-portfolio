import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export function ProductGrid({ products, categorySlug }: { products: Product[]; categorySlug: string }) {
  if (products.length === 0) {
    return <p className="mt-10 text-muted">No garments are published in this selection yet.</p>;
  }
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product.slug} className="border border-charcoal/10 bg-white">
          <div className="aspect-[4/5] overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-ivory-deep">{product.name}</div>
            )}
          </div>
          <div className="px-5 py-5">
            <p className="text-xs tracking-[0.18em] text-gold uppercase">{product.garment_type}</p>
            <h3 className="mt-1 font-serif text-2xl">{product.name}</h3>
            <div className="mt-3 flex gap-2">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color.slug}
                  title={color.name}
                  className="h-4 w-4 rounded-full border border-charcoal/20"
                  style={{ background: color.hex_value }}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">{product.price_label}</p>
            <div className="mt-5 flex gap-3">
              <Button href={`/products/${product.slug}`} variant="ghost">
                View Details
              </Button>
              <Button
                href={`/customize?category=${categorySlug}&product=${product.slug}${
                  product.suit_type ? `&suit=${product.suit_type}` : ""
                }`}
                variant="navy"
              >
                Customize
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
