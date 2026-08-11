"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, Phone, Truck, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPriceCents } from "@/types/database";
import type { CartItemInput } from "@/types/orders";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/orders";
import { useCartStore } from "@/lib/cart-store";
import { createOrderFromCart } from "@/lib/supabase/order-actions";

const PAYMENT_ICONS: Record<PaymentMethod, React.ElementType> = {
  mpesa: Phone,
  bank_transfer: Banknote,
  cod: Truck,
  card_on_delivery: CreditCard,
};

type Props = {
  defaultEmail: string;
  unitPriceCents: number;
  appliedDiscountCents: number;
  appliedCouponId?: string | null;
  /** Override for the product title shown in line items when cart only stores id. */
  productTitles?: Record<string, string>;
};

export function CheckoutForm({ defaultEmail, unitPriceCents, appliedDiscountCents, appliedCouponId, productTitles = {} }: Props) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("mpesa");

  const subtotalCents = items.reduce(
    (sum, item) => sum + unitPriceCents * item.quantity,
    0
  );
  const shippingCents = subtotalCents > 0 ? 999 : 0;
  const totalCents = Math.max(0, subtotalCents - appliedDiscountCents + shippingCents);

  const cartItems: CartItemInput[] = items.map((i) => ({
    product_id: i.productId,
    sku: i.productId,
    title: productTitles[i.productId] ?? `Product ${i.productId}`,
    unit_price_cents: unitPriceCents,
    quantity: i.quantity,
  }));

  const onSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);
    const shipping = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      line1: String(formData.get("line1") ?? ""),
      line2: String(formData.get("line2") ?? ""),
      city: String(formData.get("city") ?? ""),
      region: String(formData.get("region") ?? ""),
      postal_code: String(formData.get("postal_code") ?? ""),
      country: String(formData.get("country") ?? "KE"),
    };
    const result = await createOrderFromCart({
      email: String(formData.get("email") ?? ""),
      shipping,
      items: cartItems,
      subtotal_cents: subtotalCents,
      discount_cents: appliedDiscountCents,
      coupon_id: appliedCouponId,
      payment_method: paymentMethod,
      customer_note: String(formData.get("note") ?? "") || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearCart();
    router.push(`/checkout/success?order=${result.data!.order_id}`);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <a href="/">Continue shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Contact */}
        <Section title="Contact">
          <Field label="Email" required>
            <Input name="email" type="email" required defaultValue={defaultEmail} />
          </Field>
        </Section>

        {/* Shipping */}
        <Section title="Shipping address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input name="name" required autoComplete="name" />
            </Field>
            <Field label="Phone">
              <Input name="phone" type="tel" autoComplete="tel" />
            </Field>
            <Field label="Address line 1" required className="sm:col-span-2">
              <Input name="line1" required autoComplete="address-line1" />
            </Field>
            <Field label="Address line 2" className="sm:col-span-2">
              <Input name="line2" autoComplete="address-line2" />
            </Field>
            <Field label="City" required>
              <Input name="city" required autoComplete="address-level2" />
            </Field>
            <Field label="Region / County">
              <Input name="region" autoComplete="address-level1" />
            </Field>
            <Field label="Postal code" required>
              <Input name="postal_code" required autoComplete="postal-code" />
            </Field>
            <Field label="Country" required>
              <Input name="country" required defaultValue="KE" autoComplete="country" />
            </Field>
          </div>
          <Field label="Order notes (optional)" className="mt-4">
            <textarea
              name="note"
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Delivery instructions, gift message, etc."
            />
          </Field>
        </Section>

        {/* Payment method */}
        <Section title="Payment method">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => {
              const Icon = PAYMENT_ICONS[m];
              const info = PAYMENT_METHODS[m];
              const selected = paymentMethod === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors",
                    selected ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">{info.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {m === "mpesa" && "Mobile money"}
                      {m === "bank_transfer" && "Direct bank deposit"}
                      {m === "cod" && "Pay when delivered"}
                      {m === "card_on_delivery" && "Mobile POS at your door"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Order summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPriceCents(subtotalCents)}</span>
            </div>
            {appliedDiscountCents > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="tabular-nums">−{formatPriceCents(appliedDiscountCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">
                {shippingCents === 0 ? "Free" : formatPriceCents(shippingCents)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPriceCents(totalCents)}</span>
            </div>
          </div>

          <Button type="submit" disabled={submitting} size="lg" className="mt-6 w-full">
            {submitting ? "Placing order..." : "Place order"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By placing your order you agree to cluxe's terms.
          </p>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
