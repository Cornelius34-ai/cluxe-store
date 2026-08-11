import Link from "next/link";

import { formatPriceCents } from "@/types/database";
import type { Product, Discount } from "@/types/database";
import { cn } from "@/lib/utils";
import { computeEffectivePricing } from "@/lib/pricing";

type Props = {
  product: Product;
  /** If provided, used to compute the effective (discounted) price. */
  discounts?: Discount[];
  className?: string;
};

export function ProductCard({ product, discounts = [], className }: Props) {
  const pricing = computeEffectivePricing(product, discounts);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent",
        className
      )}
    >
      <div className="relative aspect-square bg-muted">
        {pricing.isOnSale && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
            {pricing.discountLabel ?? "Sale"}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:underline">
          {product.title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={cn("text-sm font-semibold", pricing.isOnSale && "text-destructive")}>
            {formatPriceCents(pricing.currentPriceCents, product.currency)}
          </span>
          {pricing.isOnSale && pricing.strikeThroughCents > pricing.currentPriceCents && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPriceCents(pricing.strikeThroughCents, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
