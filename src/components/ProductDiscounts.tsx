import Link from "next/link";
import { Tag, ExternalLink, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Discount } from "@/types/database";

type Props = {
  productId: string;
  discounts: Discount[];
};

const SCOPE_LABEL: Record<Discount["scope"], string> = {
  site: "Site-wide",
  category: "Category",
  product: "This product",
};

export function ProductDiscounts({ productId, discounts }: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">Discounts</h2>
          <p className="text-sm text-muted-foreground">
            Discounts that apply to this product (site-wide + category + product-scoped).
          </p>
        </div>
        <Link
          href={`/admin/discounts?scope=product&product_id=${productId}`}
          className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          New discount
        </Link>
      </div>

      {discounts.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          <Tag className="mx-auto mb-2 h-6 w-6 opacity-30" />
          No discounts apply to this product right now.
        </div>
      ) : (
        <div className="divide-y">
          {discounts.map((d) => {
            const expired = d.ends_at && new Date(d.ends_at).getTime() <= Date.now();
            const future = d.starts_at && new Date(d.starts_at).getTime() > Date.now();
            const status = expired ? "Expired" : future ? "Scheduled" : "Active";
            const statusClass = {
              Active: "bg-emerald-100 text-emerald-800",
              Scheduled: "bg-blue-100 text-blue-800",
              Expired: "bg-muted text-muted-foreground",
            }[status];
            return (
              <div key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", statusClass)}>
                      {status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {d.type === "percent" ? `${d.value}% off` : `$${(d.value / 100).toFixed(2)} off`} · {SCOPE_LABEL[d.scope]}
                    {d.ends_at && ` · ends ${new Date(d.ends_at).toLocaleDateString()}`}
                  </div>
                </div>
                <Link
                  href="/admin/discounts"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Manage <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
