import Link from "next/link";

import { formatPriceCents } from "@/types/database";
import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: Props) {
  const onSale =
    product.compare_at_cents != null && product.compare_at_cents > product.retail_price_cents;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent",
        className
      )}
    >
      <div className="relative aspect-square bg-muted">
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
            Sale
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:underline">
          {product.title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={cn("text-sm font-semibold", onSale && "text-destructive")}>
            {formatPriceCents(product.retail_price_cents, product.currency)}
          </span>
          {onSale && product.compare_at_cents != null && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPriceCents(product.compare_at_cents, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
