"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Power, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Discount } from "@/types/database";
import { toggleDiscountActive, deleteDiscount } from "@/lib/supabase/actions";

type Props = { discounts: Discount[] };

export function DiscountsList({ discounts }: Props) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<"all" | "active" | "expired">("all");

  const now = Date.now();
  const filtered = discounts.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return d.is_active && (!d.ends_at || new Date(d.ends_at).getTime() > now);
    if (filter === "expired") return d.ends_at && new Date(d.ends_at).getTime() <= now;
    return true;
  });

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">All discounts</h2>
        <div className="flex gap-1 rounded-md border bg-background p-0.5">
          {(["all", "active", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium capitalize transition-colors",
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
          No discounts.
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((d) => {
            const expired = d.ends_at && new Date(d.ends_at).getTime() <= now;
            const status = !d.is_active ? "Disabled" : expired ? "Expired" : "Active";
            const statusClass = {
              Active: "bg-emerald-100 text-emerald-800",
              Disabled: "bg-muted text-muted-foreground",
              Expired: "bg-amber-100 text-amber-800",
            }[status];

            return (
              <div key={d.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{d.name}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", statusClass)}>
                        {status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {d.type === "percent" ? `${d.value}% off` : `$${(d.value / 100).toFixed(2)} off`}{" "}
                      · {d.scope === "site" ? "Entire site" : d.scope === "category" ? "Category" : "Product"}
                      {d.starts_at && ` · from ${new Date(d.starts_at).toLocaleDateString()}`}
                      {d.ends_at && ` · until ${new Date(d.ends_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={async () => {
                        const r = await toggleDiscountActive(d.id, !d.is_active);
                        if (!r.ok) alert(r.error);
                        router.refresh();
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title={d.is_active ? "Disable" : "Enable"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete discount "${d.name}"? This cannot be undone.`)) return;
                        const r = await deleteDiscount(d.id);
                        if (!r.ok) alert(r.error);
                        router.refresh();
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
