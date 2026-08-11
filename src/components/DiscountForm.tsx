"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Product } from "@/types/database";
import { createDiscount } from "@/lib/supabase/actions";

type Props = {
  categories: Category[];
  products: Product[];
};

export function DiscountForm({ categories, products }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [scope, setScope] = React.useState<"site" | "category" | "product">("site");

  return (
    <form
      action={async (fd) => {
        setSaving(true);
        setError(null);
        const r = await createDiscount(fd);
        setSaving(false);
        if (!r.ok) setError(r.error);
        else router.refresh();
      }}
      className="rounded-lg border bg-card p-6"
    >
      <h2 className="text-lg font-semibold">New discount</h2>

      <Field label="Name" required className="mt-4">
        <Input name="name" required placeholder="Black Friday 50%" />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Type" required>
          <select
            name="type"
            defaultValue="percent"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="percent">Percent off (%)</option>
            <option value="fixed">Fixed amount (cents)</option>
          </select>
        </Field>
        <Field label="Value" required hint="e.g. 50 = 50%, or 1000 = $10.00">
          <Input name="value" type="number" min="1" required placeholder="50" />
        </Field>
      </div>

      <Field label="Scope" required className="mt-4">
        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="site">Entire site</option>
          <option value="category">Specific category</option>
          <option value="product">Specific product</option>
        </select>
      </Field>

      {scope === "category" && (
        <Field label="Category" required className="mt-4">
          <select
            name="category_id"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      )}

      {scope === "product" && (
        <Field label="Product" required className="mt-4">
          <select
            name="product_id"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </Field>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Starts at">
          <Input name="starts_at" type="datetime-local" />
        </Field>
        <Field label="Ends at">
          <Input name="ends_at" type="datetime-local" />
        </Field>
      </div>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Coupon (optional)
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Field label="Code">
          <Input name="coupon_code" placeholder="WELCOME10" />
        </Field>
        <Field label="Max uses">
          <Input name="max_uses" type="number" min="1" placeholder="unlimited" />
        </Field>
        <Field label="Min order ($)">
          <Input name="min_order" type="number" min="0" placeholder="0" />
        </Field>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={saving} className="mt-6 w-full">
        <Plus className="h-4 w-4" />
        {saving ? "Creating..." : "Create discount"}
      </Button>
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
