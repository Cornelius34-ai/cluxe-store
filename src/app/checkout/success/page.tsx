import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatPriceCents } from "@/types/database";
import { PAYMENT_METHODS, type Order } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order placed — cluxe" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) redirect("/");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          Back to home
        </Link>
      </main>
    );
  }

  const order = data as Order & { order_items: Array<{ title: string; quantity: number; line_total_cents: number }> };
  const paymentInfo = PAYMENT_METHODS[order.payment_method];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Reveal>
        <div className="rounded-lg border bg-card p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-semibold">Order placed</h1>
              <p className="text-sm text-muted-foreground">
                Order <span className="font-mono">{order.order_number}</span>
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </h3>
            <div className="mt-3 divide-y">
              {order.order_items.map((item, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.title}{" "}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums">{formatPriceCents(item.line_total_cents, order.currency)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-1 border-t pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPriceCents(order.subtotal_cents, order.currency)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="tabular-nums">−{formatPriceCents(order.discount_cents, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{formatPriceCents(order.shipping_cents, order.currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPriceCents(order.total_cents, order.currency)}</span>
            </div>
          </div>

          {/* Payment instructions */}
          <div className="mt-6 rounded-md border bg-muted/50 p-4 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How to pay — {paymentInfo.label}
            </div>
            <p className="mt-2 leading-relaxed">
              {paymentInfo.instructions(formatPriceCents(order.total_cents, order.currency), order.order_number)}
            </p>
          </div>

          {/* Shipping */}
          <div className="mt-6 border-t pt-6 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ships to
            </div>
            <div className="mt-2 leading-relaxed">
              {order.shipping_name}
              <br />
              {order.shipping_line1}
              {order.shipping_line2 && (
                <>
                  <br />
                  {order.shipping_line2}
                </>
              )}
              <br />
              {order.shipping_city}
              {order.shipping_region && `, ${order.shipping_region}`} {order.shipping_postal_code}
              <br />
              {order.shipping_country}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/account/orders">
                View your orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
