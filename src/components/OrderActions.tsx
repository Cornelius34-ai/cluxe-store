"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Truck, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markOrderPaid, updateOrderStatus } from "@/lib/supabase/order-actions";

type Action = "markPaid" | "processing" | "ship" | "deliver" | "complete" | "cancel" | "refund";

type Props = {
  orderId: string;
  status: string;
  paymentStatus: string;
};

export function OrderActions({ orderId, status, paymentStatus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<Action | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showShipForm, setShowShipForm] = React.useState(false);
  const [carrier, setCarrier] = React.useState("");
  const [tracking, setTracking] = React.useState("");
  const [trackingUrl, setTrackingUrl] = React.useState("");
  const [paymentRef, setPaymentRef] = React.useState("");

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(null);
    const r = await fn();
    if (!r.ok) setError(r.error ?? "Failed");
    else router.refresh();
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Actions
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {paymentStatus !== "paid" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => {
              const ref = prompt("Payment reference (optional, e.g. M-Pesa code):", "");
              if (ref === null) return;
              setBusy("markPaid");
              run(() => markOrderPaid(orderId, ref));
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark paid
          </Button>
        )}

        {status === "paid" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => {
              setBusy("processing");
              run(() => updateOrderStatus(orderId, "processing"));
            }}
          >
            Start preparing
          </Button>
        )}

        {(status === "processing" || status === "paid") && !showShipForm && (
          <Button size="sm" onClick={() => setShowShipForm(true)} disabled={busy !== null}>
            <Truck className="h-3.5 w-3.5" />
            Mark shipped
          </Button>
        )}

        {status === "shipped" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => {
              setBusy("deliver");
              run(() => updateOrderStatus(orderId, "delivered"));
            }}
          >
            Mark delivered
          </Button>
        )}

        {(status === "delivered" || status === "shipped") && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => {
              setBusy("complete");
              run(() => updateOrderStatus(orderId, "completed"));
            }}
          >
            Complete
          </Button>
        )}

        {!["cancelled", "refunded", "completed"].includes(status) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            disabled={busy !== null}
            onClick={() => {
              if (!confirm(`Cancel order ${orderId.slice(0, 8)}?`)) return;
              setBusy("cancel");
              run(() => updateOrderStatus(orderId, "cancelled"));
            }}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </div>

      {showShipForm && (
        <form
          className="mt-4 space-y-3 rounded-md border bg-muted/30 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy("ship");
            const r = await updateOrderStatus(orderId, "shipped", {
              carrier,
              tracking,
              tracking_url: trackingUrl,
            });
            setBusy(null);
            if (!r.ok) {
              setError(r.error ?? "Failed");
              return;
            }
            setShowShipForm(false);
            setCarrier("");
            setTracking("");
            setTrackingUrl("");
            router.refresh();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium">Carrier</label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="DHL, Posta, etc." className="mt-1 h-9" required />
            </div>
            <div>
              <label className="text-xs font-medium">Tracking number</label>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} className="mt-1 h-9" required />
            </div>
            <div>
              <label className="text-xs font-medium">Tracking URL (optional)</label>
              <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." className="mt-1 h-9" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy !== null}>
              <Save className="h-3.5 w-3.5" />
              {busy === "ship" ? "Saving..." : "Save tracking"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowShipForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
