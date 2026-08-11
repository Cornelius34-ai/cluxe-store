"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPriceCents } from "@/types/database";
import { updateProductStock } from "@/lib/supabase/actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  retail_price_cents: number;
  currency: string;
  stock: number;
  is_active: boolean;
};

type InventoryRowProps = {
  product: Row;
};

export function InventoryRow({ product }: InventoryRowProps) {
  const router = useRouter();
  const [stock, setStock] = React.useState(String(product.stock));
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);

  const onSave = async () => {
    const n = Number(stock);
    if (!Number.isInteger(n) || n < 0) {
      setError("Stock must be a non-negative integer");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateProductStock(product.id, n);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="col-span-5 min-w-0">
        <div className="truncate text-sm font-medium">{product.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          /{product.slug} · {formatPriceCents(product.retail_price_cents, product.currency)}
        </div>
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <Input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => {
            setStock(e.target.value);
            setDirty(e.target.value !== String(product.stock));
            setError(null);
          }}
          className="h-9 w-24"
        />
        <span
          className={cn(
            "text-xs",
            product.stock === 0
              ? "text-destructive"
              : product.stock < 5
                ? "text-amber-600"
                : "text-muted-foreground"
          )}
        >
          {product.stock === 0
            ? "Out of stock"
            : product.stock < 5
              ? "Low"
              : "In stock"}
        </span>
      </div>
      <div className="col-span-4 flex items-center justify-end gap-2">
        {error && (
          <span className="inline-flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !dirty}
          className="h-9"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
