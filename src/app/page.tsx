import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/supabase/queries";
import { formatPriceCents } from "@/types/database";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
  ]);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <Reveal as="section" className="mx-auto w-full max-w-7xl px-6 pt-16 pb-12">
        <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
          Modern clothing, considered design.
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
          Curated essentials, built to last. Free shipping over $100.
        </p>
      </Reveal>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-6 py-8">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.05}>
              <Link
                href={`/category/${category.slug}`}
                className="group block overflow-hidden rounded-lg border bg-card p-8 transition-colors hover:bg-accent"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Collection
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {category.name}
                </div>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground">
                  Browse {category.name.toLowerCase()} →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto w-full max-w-7xl px-6 py-8 pb-24">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.04}>
              <Link
                href={`/product/${product.slug}`}
                className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:underline">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold">
                    {formatPriceCents(product.retail_price_cents, product.currency)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
