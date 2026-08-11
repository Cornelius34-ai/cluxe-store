import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category ? `${category.name} — cluxe` : "Category — cluxe",
    description: category
      ? `Shop ${category.name.toLowerCase()} at cluxe.`
      : "Browse this category.",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug, 24),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length === 0
            ? "No products yet"
            : `${products.length} ${products.length === 1 ? "product" : "products"}`}
        </p>
      </Reveal>

      {products.length === 0 ? (
        <div className="mt-12 rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No products in this category yet.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.04}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
