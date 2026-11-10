import { CustomizeWizard } from "@/components/customize/CustomizeWizard";
import { api } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customize" };

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; product?: string; suit?: string }>;
}) {
  const query = await searchParams;
  const [categories, site] = await Promise.all([
    api.categories().catch(() => []),
    api.site().catch(() => null),
  ]);
  const details = await Promise.all(
    categories.map(async (category) => {
      try {
        return await api.category(category.slug);
      } catch {
        return category;
      }
    })
  );
  const products = await api.products().catch(() => []);

  return (
    <CustomizeWizard
      categories={details}
      products={products}
      site={site}
      initialCategory={query.category}
      initialProduct={query.product}
      initialSuit={query.suit}
    />
  );
}
