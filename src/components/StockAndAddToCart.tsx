"use client";

import * as React from "react";
import { Check, ShoppingBag, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  productId: string;
  productSlug: string;
  initialStock: number;
};

export function StockAndAddToCart({ productId, productSlug, initialStock }: Props) {
  const [stock, setStock] = React.useState(initialStock);
  const [added, setAdded] = React.useState(false);
  const [adding, setAdding] = React.useState(false);

  const addItem = useCartStore((s) => s.addItem);

  // Subscribe to realtime stock changes for this product
  React.useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
          .channel(`product-${productId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "products",
              filter: `id=eq.${productId}`,
            },
            (payload) => {
              if (cancelled) return;
              const next = (payload.new as { stock?: number }).stock;
              if (typeof next === "number") setStock(next);
            }
          )
          .subscribe();

        cleanup = () => {
          supabase.removeChannel(channel);
        };
      } catch {
        // realtime unavailable, fall back to initial server value
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [productId]);

  const inStock = stock > 0;
  const lowStock = stock > 0 && stock < 5;

  const onAdd = () => {
    if (!inStock || adding) return;
    setAdding(true);
    addItem(productSlug, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setAdding(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <div
        className={cn(
          "flex items-center gap-2 text-sm",
          !inStock
            ? "text-destructive"
            : lowStock
              ? "text-amber-600"
              : "text-muted-foreground"
        )}
      >
        {!inStock ? (
          <AlertCircle className="h-4 w-4" />
        ) : lowStock ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span>
          {!inStock
            ? "Out of stock"
            : lowStock
              ? `Only ${stock} left`
              : "In stock"}
        </span>
        {inStock && lowStock && (
          <span className="ml-1 text-xs text-muted-foreground">
            (live)
          </span>
        )}
      </div>

      <Button
        onClick={onAdd}
        disabled={!inStock || adding}
        size="lg"
        className="w-full sm:w-auto"
      >
        <ShoppingBag className="h-4 w-4" />
        {!inStock
          ? "Unavailable"
          : added
            ? "Added to cart"
            : adding
              ? "Adding..."
              : "Add to cart"}
      </Button>
    </div>
  );
}
