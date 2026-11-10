import type { SuitType } from "@/lib/types";
import Link from "next/link";

export function SuitTypePicker({
  categorySlug,
  types,
  active,
}: {
  categorySlug: string;
  types: SuitType[];
  active?: string;
}) {
  return (
    <div className="mt-10">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Suit type</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {types.map((type) => {
          const selected = active === type.slug;
          return (
            <Link
              key={type.slug}
              href={`/shop/${categorySlug}?suit=${type.slug}`}
              className={`overflow-hidden border ${selected ? "border-gold" : "border-charcoal/10"} bg-white`}
            >
              {type.image ? <img src={type.image} alt={type.name} className="h-44 w-full object-cover" /> : null}
              <div className="px-4 py-4">
                <h2 className="font-serif text-xl">{type.name}</h2>
                <p className="mt-1 text-sm text-muted">{type.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
