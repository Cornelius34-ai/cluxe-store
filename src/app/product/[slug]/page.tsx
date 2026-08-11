import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";

import { getProductBySlug } from "@/lib/supabase/queries";
import { formatPriceCents } from "@/types/database";
import { Reveal } from "@/components/Reveal";
import { StockAndAddToCart } from "@/components/StockAndAddToCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product — cluxe" };
  return {
    title: `${product.title} — cluxe`,
    description: product.description ?? `Buy ${product.title} at cluxe.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
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
      </Reveal>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image placeholder */}
        <Reveal>
          <div className="aspect-square rounded-lg border bg-muted" />
        </Reveal>

        {/* Details */}
        <Reveal delay={0.05}>
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {product.title}
            </h1>

            {product.rating_avg != null && product.rating_count != null && product.rating_count > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-current" />
                <span>
                  {product.rating_avg.toFixed(1)} ({product.rating_count})
                </span>
              </div>
            )}

            <div className="mt-4 text-2xl font-semibold">
              {formatPriceCents(product.retail_price_cents, product.currency)}
            </div>

            {product.description && (
              <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            <StockAndAddToCart
              productId={product.id}
              productSlug={product.slug}
              initialStock={product.stock}
            />

            <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
              <p>Free shipping over $100. 30-day returns.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
