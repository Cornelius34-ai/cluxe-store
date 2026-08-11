import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getMyOrders } from "@/lib/supabase/orders";
import { formatPriceCents } from "@/types/database";
import { PAYMENT_METHODS } from "@/types/orders";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — cluxe" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  processing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground",
};

export default async function MyOrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/account/orders");

  const orders = await getMyOrders();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History of your purchases at cluxe.
        </p>
      </Reveal>

      <div className="mt-8">
        {orders.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
            >
              Start shopping
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y rounded-lg border bg-card">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block px-4 py-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{order.order_number}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_CLASS[order.status] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"} ·{" "}
                      {PAYMENT_METHODS[order.payment_method]?.label ?? order.payment_method}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">
                      {formatPriceCents(order.total_cents, order.currency)}
                    </div>
                    {order.tracking_number && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Track: {order.tracking_number}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
