"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPriceCents } from "@/types/database";
import {
  createVariant,
  deleteVariant,
  updateProductStock,
  updateVariantStock,
} from "@/lib/supabase/actions";

type Variant = {
  id: string;
  sku: string;
  option1_value: string;
  option2_value: string;
  stock: number;
  price_cents: number | null;
};

type StockMovement = {
  id: string;
  delta: number;
  reason: string;
  note: string | null;
  created_at: string;
};

type Props = {
  productId: string;
  variants: Variant[];
  movements: StockMovement[];
};

export function ProductEditTabs({ productId, variants, movements }: Props) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"variants" | "stock" | "log">("variants");

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex border-b">
        {(["variants", "stock", "log"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-3 text-sm font-medium capitalize transition-colors",
              tab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "variants" && `Variants (${variants.length})`}
            {t === "stock" && "Stock"}
            {t === "log" && `Log (${movements.length})`}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "variants" && <VariantsTab productId={productId} variants={variants} onChange={() => router.refresh()} />}
        {tab === "stock" && <StockTab productId={productId} onChange={() => router.refresh()} />}
        {tab === "log" && <LogTab movements={movements} />}
      </div>
    </div>
  );
}

function VariantsTab({
  productId,
  variants,
  onChange,
}: {
  productId: string;
  variants: Variant[];
  onChange: () => void;
}) {
  return (
    <div className="space-y-6">
      <form
        action={async (fd) => {
          const result = await createVariant(productId, fd);
          if (result.ok) onChange();
          else alert(result.error);
        }}
        className="rounded-lg border bg-muted/30 p-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div>
            <label className="text-xs font-medium">SKU</label>
            <Input name="sku" required className="mt-1 h-9" placeholder="TEE-BLK-XS" />
          </div>
          <div>
            <label className="text-xs font-medium">Size</label>
            <Input name="option1_value" required className="mt-1 h-9" placeholder="XS" />
          </div>
          <div>
            <label className="text-xs font-medium">Color</label>
            <Input name="option2_value" className="mt-1 h-9" placeholder="Black" />
          </div>
          <div>
            <label className="text-xs font-medium">Price (cents)</label>
            <Input name="price_cents" type="number" min="0" className="mt-1 h-9" placeholder="—" />
          </div>
          <div>
            <label className="text-xs font-medium">Stock</label>
            <Input name="stock" type="number" min="0" defaultValue="0" className="mt-1 h-9" />
          </div>
        </div>
        <Button type="submit" size="sm" className="mt-3">
          <Plus className="h-3.5 w-3.5" />
          Add variant
        </Button>
      </form>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No variants yet. Add one above.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function VariantRow({ variant, onChange }: { variant: Variant; onChange: () => void }) {
  const [stock, setStock] = React.useState(String(variant.stock));
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
      <div className="col-span-3 truncate font-mono text-xs">{variant.sku}</div>
      <div className="col-span-2">
        {variant.option1_value} {variant.option2_value && `/ ${variant.option2_value}`}
      </div>
      <div className="col-span-2">
        {variant.price_cents != null
          ? formatPriceCents(variant.price_cents)
          : <span className="text-muted-foreground">—</span>}
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <Input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-8 w-20"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={saving || stock === String(variant.stock)}
          onClick={async () => {
            setSaving(true);
            const r = await updateVariantStock(variant.id, Number(stock));
            if (!r.ok) alert(r.error);
            onChange();
            setSaving(false);
          }}
        >
          Save
        </Button>
      </div>
      <div className="col-span-3 text-right">
        <form
          action={async () => {
            if (!confirm("Delete this variant?")) return;
            const r = await deleteVariant(variant.id);
            if (!r.ok) alert(r.error);
            onChange();
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

function StockTab({ productId, onChange }: { productId: string; onChange: () => void }) {
  const [stock, setStock] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  return (
    <form
      className="max-w-md space-y-3"
      action={async (fd) => {
        setSaving(true);
        const r = await updateProductStock(productId, Number(fd.get("stock")), String(fd.get("note") ?? ""));
        if (!r.ok) alert(r.error);
        setStock("");
        setNote("");
        onChange();
        setSaving(false);
      }}
    >
      <div>
        <label className="text-sm font-medium">New stock value</label>
        <Input name="stock" type="number" min="0" required className="mt-1.5" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Note (optional)</label>
        <Input name="note" className="mt-1.5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. received shipment" />
      </div>
      <Button type="submit" disabled={saving || !stock}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Update stock"}
      </Button>
    </form>
  );
}

function LogTab({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) {
    return <p className="text-sm text-muted-foreground">No stock changes logged yet.</p>;
  }
  return (
    <div className="divide-y rounded-lg border">
      {movements.map((m) => (
        <div key={m.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
          <div className="col-span-2 text-xs text-muted-foreground">
            {new Date(m.created_at).toLocaleString()}
          </div>
          <div className="col-span-2 tabular-nums">
            <span className={m.delta >= 0 ? "text-emerald-600" : "text-destructive"}>
              {m.delta >= 0 ? "+" : ""}
              {m.delta}
            </span>
          </div>
          <div className="col-span-2 capitalize">{m.reason}</div>
          <div className="col-span-6 text-xs text-muted-foreground">{m.note ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}
