import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await api.product(slug);
  } catch {
    notFound();
  }
  const customize = `/customize?category=${product.category}&product=${product.slug}${
    product.suit_type ? `&suit=${product.suit_type}` : ""
  }`;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2">
      <div>
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full object-cover" />
        ) : null}
      </div>
      <div>
        <nav className="text-sm text-muted">
          <Link href="/shop">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop/${product.category}`}>{product.category}</Link>
        </nav>
        <h1 className="mt-4 font-serif text-5xl">{product.name}</h1>
        <p className="mt-2 text-sm tracking-[0.16em] text-gold uppercase">{product.garment_type}</p>
        <p className="mt-6 leading-relaxed text-muted">{product.description}</p>
        <p className="mt-6 text-lg">{product.price_label}</p>
        <div className="mt-4 flex gap-2">
          {product.colors.map((color) => (
            <span
              key={color.slug}
              className="h-6 w-6 rounded-full border border-charcoal/20"
              style={{ background: color.hex_value }}
              title={color.name}
            />
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <Button href={customize}>Add to Customize</Button>
          <Button href="/contact" variant="ghost">
            Inquiry Now
          </Button>
        </div>
      </div>
    </div>
  );
}
