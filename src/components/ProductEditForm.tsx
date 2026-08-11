"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, Category } from "@/types/database";
import { updateProduct } from "@/lib/supabase/actions";

type Props = {
  product: Product;
  categories: Category[];
};

export function ProductEditForm({ product, categories }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const r = await updateProduct(product.id, formData);
    setSaving(false);
    if (!r.ok) setError(r.error);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  };

  return (
    <form action={onSubmit} className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Product details</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <Input name="title" required defaultValue={product.title} />
        </Field>
        <Field label="Slug" required hint="URL identifier, lowercase and hyphenated">
          <Input
            name="slug"
            required
            defaultValue={product.slug}
            pattern="[a-z0-9-]+"
            onChange={(e) => (e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          />
        </Field>
      </div>

      <Field label="Description" className="mt-4">
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Price (cents)" required hint="10000 = $100.00">
          <Input name="retail_price_cents" type="number" min="0" required defaultValue={product.retail_price_cents} />
        </Field>
        <Field label="Compare-at (cents)" hint="Strike-through price">
          <Input name="compare_at_cents" type="number" min="0" defaultValue={product.compare_at_cents ?? ""} />
        </Field>
        <Field label="Cost (cents)" hint="Your cost (hidden from customers)">
          <Input name="cost_cents" type="number" min="0" defaultValue={product.cost_cents ?? ""} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Stock">
          <Input name="stock" type="number" min="0" defaultValue={product.stock} />
        </Field>
        <Field label="Low-stock threshold">
          <Input name="low_stock_threshold" type="number" min="0" defaultValue={product.low_stock_threshold} />
        </Field>
        <Field label="Weight (grams)">
          <Input name="weight_grams" type="number" min="0" defaultValue={product.weight_grams ?? ""} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            name="category_id"
            defaultValue={product.category_id ?? ""}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Vendor / Brand">
          <Input name="vendor" defaultValue={product.vendor ?? ""} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Barcode">
          <Input name="barcode" defaultValue={product.barcode ?? ""} />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Toggle name="is_active" defaultChecked={product.is_active} label="Active (visible in store)" />
        <Toggle name="is_featured" defaultChecked={product.is_featured} label="Featured (home page)" />
        <Toggle name="is_draft" defaultChecked={product.is_draft} label="Draft (hide from store)" />
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Saved.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-input text-foreground focus:ring-foreground"
      />
      <span>{label}</span>
    </label>
  );
}
