"use client";

import * as React from "react";
import { Trash2, Ticket, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { formatPriceCents } from "@/types/database";

type AppliedCoupon = {
  code: string;
  discount_cents: number;
};

export function CartView() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  // Demo prices for now (server should provide these in real implementation)
  const PRICE_CENTS = 4500;

  const subtotalCents = items.reduce(
    (sum, item) => sum + PRICE_CENTS * item.quantity,
    0
  );

  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState<AppliedCoupon | null>(null);
  const [applying, setApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onApply = async () => {
    if (!code.trim() || subtotalCents <= 0) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), cart_total_cents: subtotalCents }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not apply coupon");
        return;
      }
      setApplied({ code: code.trim().toUpperCase(), discount_cents: data.discount_cents });
      setCode("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  const onRemove = () => {
    setApplied(null);
    setError(null);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  const totalCents = Math.max(0, subtotalCents - (applied?.discount_cents ?? 0));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1" />
          </div>
          {items.map((item) => (
            <div key={item.productId} className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0">
              <div className="col-span-6 truncate">Product {item.productId}</div>
              <div className="col-span-2 flex items-center justify-center gap-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="h-7 w-7 rounded border text-sm hover:bg-accent"
                >−</button>
                <span className="w-8 text-center tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="h-7 w-7 rounded border text-sm hover:bg-accent"
                >+</button>
              </div>
              <div className="col-span-3 text-right tabular-nums">
                {formatPriceCents(PRICE_CENTS * item.quantity)}
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Order summary</h3>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPriceCents(subtotalCents)}</span>
            </div>
            {applied && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  {applied.code}
                </span>
                <span className="tabular-nums">−{formatPriceCents(applied.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPriceCents(totalCents)}</span>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <label className="text-sm font-medium">Promo code</label>
            {applied ? (
              <div className="mt-2 flex items-center justify-between rounded-md border bg-emerald-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-1 text-emerald-900">
                  <Check className="h-4 w-4" />
                  {applied.code} applied
                </span>
                <button onClick={onRemove} className="text-emerald-900 hover:text-emerald-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="h-9"
                  disabled={applying}
                />
                <Button onClick={onApply} disabled={!code.trim() || applying} size="sm" className="h-9">
                  {applying ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
          </div>

          <Button className="mt-6 w-full" size="lg">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
