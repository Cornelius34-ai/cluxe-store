import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/supabase/queries";
import { formatPriceCents } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
  ]);

  return (
    <main className="flex min-h-screen flex-col py-12">
      {/* Hero */}
      <section className="mx-auto w-full max-w-4xl px-6 space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to cluxe
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Modern clothing, considered design.
        </p>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-4xl px-6 mt-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Categories
        </h2>
        {categories.length === 0 ? (
          <div className="rounded border bg-muted p-6 text-center">
            <span className="text-muted-foreground text-sm">
              No categories yet
            </span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group rounded border bg-background p-6 transition hover:border-foreground"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:underline">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  /{category.slug}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full max-w-4xl px-6 mt-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Featured
        </h2>
        {featured.length === 0 ? (
          <div className="rounded border bg-muted p-6 text-center">
            <span className="text-muted-foreground text-sm">
              No featured products yet
            </span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group rounded border bg-background p-4 transition hover:border-foreground"
              >
                <div className="aspect-square rounded bg-muted mb-3" />
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:underline">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatPriceCents(product.retail_price_cents, product.currency)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
