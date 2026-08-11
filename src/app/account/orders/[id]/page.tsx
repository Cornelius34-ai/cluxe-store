import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getMyOrder } from "@/lib/supabase/orders";
import { formatPriceCents } from "@/types/database";
import { PAYMENT_METHODS } from "@/types/orders";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  processing: "Preparing your order",
  shipped: "On the way",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_TIMELINE = ["pending", "paid", "processing", "shipped", "delivered", "completed"];

export default async function MyOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/account/orders/${id}`);

  const order = await getMyOrder(id);
  if (!order) notFound();

  const currentStepIdx = STATUS_TIMELINE.indexOf(order.status);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Reveal>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All orders
        </Link>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Order {order.order_number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </Reveal>

      {/* Timeline */}
      {["paid", "processing", "shipped", "delivered", "completed", "cancelled", "refunded"].includes(order.status) && (
        <Reveal delay={0.05}>
          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </h2>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto">
              {STATUS_TIMELINE.map((step, i) => {
                const done = i <= currentStepIdx;
                const Icon = i === 0 ? Clock : i === 1 ? CheckCircle2 : i === 2 ? Package : Truck;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full",
                          done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-xs capitalize",
                          done ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step}
                      </div>
                    </div>
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div className={cn("h-px w-8", done && i < currentStepIdx ? "bg-emerald-300" : "bg-border")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* Items */}
      <Reveal delay={0.1}>
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</h2>
          <div className="mt-4 divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <span>
                  {item.title}
                  {item.variant_label && <span className="text-muted-foreground"> · {item.variant_label}</span>}{" "}
                  <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="tabular-nums">{formatPriceCents(item.line_total_cents, order.currency)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <Row label="Subtotal" value={formatPriceCents(order.subtotal_cents, order.currency)} />
            {order.discount_cents > 0 && (
              <Row label="Discount" value={`−${formatPriceCents(order.discount_cents, order.currency)}`} className="text-emerald-600" />
            )}
            <Row label="Shipping" value={formatPriceCents(order.shipping_cents, order.currency)} />
            <Row label="Total" value={formatPriceCents(order.total_cents, order.currency)} bold />
          </div>
        </div>
      </Reveal>

      {/* Shipping + Payment */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Reveal delay={0.15}>
          <div className="rounded-lg border bg-card p-6 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shipping to
            </h3>
            <div className="mt-3 leading-relaxed">
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
              {order.shipping_phone && (
                <>
                  <br />
                  {order.shipping_phone}
                </>
              )}
            </div>
            {order.tracking_number && (
              <div className="mt-4 rounded-md border bg-muted/50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tracking
                </div>
                <div className="mt-1 text-sm">
                  {order.tracking_carrier && <span className="font-medium">{order.tracking_carrier} · </span>}
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-foreground underline"
                  >
                    Track on carrier website →
                  </a>
                )}
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="rounded-lg border bg-card p-6 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment
            </h3>
            <div className="mt-3">
              <div className="font-medium">{PAYMENT_METHODS[order.payment_method]?.label ?? order.payment_method}</div>
              <div className="text-xs text-muted-foreground">
                Status: {order.payment_status}
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {order.payment_status === "paid"
                ? "Payment confirmed."
                : order.payment_method === "mpesa"
                  ? "Send the total to Till 4567890 via M-Pesa. We'll confirm once payment lands."
                  : order.payment_method === "bank_transfer"
                    ? "Bank details were sent to your email. Transfers clear in 1-2 business days."
                    : order.payment_method === "cod"
                      ? "Pay in cash when your order is delivered."
                      : "Pay by card at your door."}
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function Row({ label, value, className, bold }: { label: string; value: string; className?: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "border-t pt-2 font-semibold", className)}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
