import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getAllOrdersAdmin } from "@/lib/supabase/orders";
import { formatPriceCents } from "@/types/database";
import { PAYMENT_METHODS } from "@/types/orders";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — cluxe admin" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
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

const PAYMENT_CLASS: Record<string, string> = {
  awaiting: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export default async function AdminOrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/orders");
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
      </main>
    );
  }

  const orders = await getAllOrdersAdmin();

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    awaitingPayment: orders.filter((o) => o.payment_status === "awaiting").length,
    revenue: orders
      .filter((o) => o.payment_status === "paid")
      .reduce((s, o) => s + o.total_cents, 0),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Reveal>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Inventory
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
            <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Awaiting payment</div>
            <div className={`mt-1 text-2xl font-semibold ${stats.awaitingPayment > 0 ? "text-amber-600" : ""}`}>
              {stats.awaitingPayment}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pending fulfillment</div>
            <div className={`mt-1 text-2xl font-semibold ${stats.pending > 0 ? "text-amber-600" : ""}`}>
              {stats.pending}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue (paid)</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{formatPriceCents(stats.revenue)}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Order</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1" />
          </div>
          {orders.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 transition-colors hover:bg-accent"
              >
                <div className="col-span-3 min-w-0">
                  <div className="truncate font-mono text-xs">{order.order_number}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="col-span-2 truncate text-xs">{order.email}</div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASS[order.status] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-xs">{PAYMENT_METHODS[order.payment_method]?.label ?? order.payment_method}</span>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      PAYMENT_CLASS[order.payment_status]
                    )}
                  >
                    {order.payment_status}
                  </span>
                </div>
                <div className="col-span-2 text-right text-sm font-semibold tabular-nums">
                  {formatPriceCents(order.total_cents, order.currency)}
                </div>
                <div className="col-span-1 text-right text-xs text-muted-foreground">→</div>
              </Link>
            ))
          )}
        </div>
      </Reveal>
    </main>
  );
}
