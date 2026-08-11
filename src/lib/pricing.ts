// src/lib/pricing.ts
// Compute the effective storefront price for a product, taking into account
// compare_at_cents (regular/original price for strike-through) and any active
// time-limited discount.

import type { Product, Discount } from "@/types/database";
import { formatPriceCents } from "@/types/database";

export type EffectivePricing = {
  /** Price the customer actually pays today. */
  currentPriceCents: number;
  /** Strike-through price (the highest price they'd have paid). */
  strikeThroughCents: number;
  /** Short label for the active discount, e.g. "20% off" or "$10 off". null if none. */
  discountLabel: string | null;
  /** Dollar amount saved vs strike-through. */
  savingsCents: number;
  /** True if there's any visible discount (compare_at OR active discount). */
  isOnSale: boolean;
};

/**
 * Compute the active discount (in cents) that applies to this product.
 * If multiple apply, picks the largest absolute reduction.
 * Only discounts that are active and within their time window are eligible.
 */
export function pickBestDiscount(
  product: Pick<Product, "retail_price_cents">,
  discounts: Discount[]
): { cents: number; discount: Discount } | null {
  const now = Date.now();
  let best: { cents: number; discount: Discount } | null = null;
  for (const d of discounts) {
    if (!d.is_active) continue;
    if (d.starts_at && new Date(d.starts_at).getTime() > now) continue;
    if (d.ends_at && new Date(d.ends_at).getTime() <= now) continue;
    const cents =
      d.type === "percent"
        ? Math.floor((product.retail_price_cents * d.value) / 100)
        : Math.min(d.value, product.retail_price_cents);
    if (!best || cents > best.cents) best = { cents, discount: d };
  }
  return best;
}

/**
 * Compute effective pricing for a product given any active discounts.
 *
 * Rules:
 * - `currentPriceCents` = retail_price minus the best discount (if any)
 * - `strikeThroughCents` = max(retail_price, compare_at_cents) — the
 *   highest price the customer would have paid today.
 * - `discountLabel` is set when an active discount reduced the price.
 * - `isOnSale` is true when the strike-through is higher than current
 *   (either compare_at > current OR a discount is active).
 */
export function computeEffectivePricing(
  product: Pick<Product, "retail_price_cents" | "compare_at_cents">,
  discounts: Discount[]
): EffectivePricing {
  const base = product.retail_price_cents;
  const best = pickBestDiscount(product, discounts);

  const currentPriceCents = best ? Math.max(0, base - best.cents) : base;

  const compareAt = product.compare_at_cents ?? 0;
  const strikeThroughCents = Math.max(base, compareAt);

  const isOnSale =
    (compareAt > currentPriceCents) || best !== null;

  const savingsCents = Math.max(0, strikeThroughCents - currentPriceCents);

  const discountLabel = best
    ? best.discount.type === "percent"
      ? `${best.discount.value}% off`
      : `${formatPriceCents(best.discount.value)} off`
    : null;

  return {
    currentPriceCents,
    strikeThroughCents,
    discountLabel,
    savingsCents,
    isOnSale,
  };
}
