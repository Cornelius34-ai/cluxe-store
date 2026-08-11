import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getAdminOrder } from "@/lib/supabase/orders";
import { formatPriceCents } from "@/types/database";
import { PAYMENT_METHODS } from "@/types/orders";
import { Reveal } from "@/components/Reveal";
import { OrderActions } from "@/components/OrderActions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/admin/orders/${id}`);
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
      </main>
    );
  }

  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight font-mono">{order.order_number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.email} · placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
            {order.status}
          </span>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Reveal>
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</h2>
              <div className="mt-4 divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 text-sm">
                    <span>
                      <span className="font-medium">{item.title}</span>
                      {item.variant_label && <span className="text-muted-foreground"> · {item.variant_label}</span>}{" "}
                      <span className="text-muted-foreground">× {item.quantity}</span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">{item.sku}</span>
                    </span>
                    <span className="tabular-nums">{formatPriceCents(item.line_total_cents, order.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 border-t pt-4 text-sm">
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
            </div>
          </Reveal>

          {/* Shipping */}
          <Reveal delay={0.05}>
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shipping</h2>
              <div className="mt-3 text-sm leading-relaxed">
                <div className="font-medium">{order.shipping_name}</div>
                {order.shipping_phone && <div className="text-xs text-muted-foreground">{order.shipping_phone}</div>}
                <div className="mt-2">
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
              {order.tracking_number && (
                <div className="mt-4 rounded-md border bg-muted/50 p-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tracking
                  </div>
                  <div className="mt-1">
                    {order.tracking_carrier && <span className="font-medium">{order.tracking_carrier} · </span>}
                    <span className="font-mono">{order.tracking_number}</span>
                  </div>
                  {order.tracking_url && (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs underline">
                      Track →
                    </a>
                  )}
                </div>
              )}
            </div>
          </Reveal>

          {/* Status history */}
          {order.history && order.history.length > 0 && (
            <Reveal delay={0.1}>
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">History</h2>
                <div className="mt-4 divide-y text-sm">
                  {order.history.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 py-2">
                      <div className="text-xs text-muted-foreground tabular-nums w-32">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                      <div className="flex-1">
                        <div>
                          {h.from_status && (
                            <span className="text-muted-foreground">{h.from_status} → </span>
                          )}
                          <span className="font-medium">{h.to_status}</span>
                        </div>
                        {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <Reveal>
            <div className="rounded-lg border bg-card p-6 text-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment</h2>
              <div className="mt-3">
                <div className="font-medium">{PAYMENT_METHODS[order.payment_method]?.label ?? order.payment_method}</div>
                <div className={cn(
                  "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs capitalize",
                  order.payment_status === "paid" && "bg-emerald-100 text-emerald-800",
                  order.payment_status === "awaiting" && "bg-amber-100 text-amber-800",
                  order.payment_status === "failed" && "bg-destructive/10 text-destructive"
                )}>
                  {order.payment_status}
                </div>
                {order.payment_reference && (
                  <div className="mt-2 text-xs">
                    Ref: <span className="font-mono">{order.payment_reference}</span>
                  </div>
                )}
                {order.payment_paid_at && (
                  <div className="text-xs text-muted-foreground">
                    Paid {new Date(order.payment_paid_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <OrderActions
              orderId={order.id}
              status={order.status}
              paymentStatus={order.payment_status}
            />
          </Reveal>
        </div>
      </div>
    </main>
  );
}
