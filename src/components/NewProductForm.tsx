"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/database";
import { createProduct } from "@/lib/supabase/actions";

type Props = { categories: Category[] };

export function NewProductForm({ categories }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setSaving(true);
        setError(null);
        const r = await createProduct(fd);
        setSaving(false);
        if (!r.ok) setError(r.error);
        else router.push(`/admin/inventory/${r.data!.id}`);
      }}
      className="rounded-lg border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <Input name="title" required placeholder="Oversized Cotton Tee" />
        </Field>
        <Field label="Slug" required hint="lowercase, hyphenated">
          <Input
            name="slug"
            required
            placeholder="oversized-cotton-tee"
            pattern="[a-z0-9-]+"
          />
        </Field>
      </div>

      <Field label="Description" className="mt-4">
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Price (cents)" required hint="4500 = $45.00">
          <Input name="retail_price_cents" type="number" min="0" required placeholder="4500" />
        </Field>
        <Field label="Compare-at (cents)">
          <Input name="compare_at_cents" type="number" min="0" placeholder="6000" />
        </Field>
        <Field label="Cost (cents)">
          <Input name="cost_cents" type="number" min="0" placeholder="1500" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Stock" hint="Initial stock (will be 0 if blank)">
          <Input name="stock" type="number" min="0" defaultValue="0" />
        </Field>
        <Field label="Low-stock threshold">
          <Input name="low_stock_threshold" type="number" min="0" defaultValue="5" />
        </Field>
        <Field label="Weight (grams)">
          <Input name="weight_grams" type="number" min="0" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            name="category_id"
            defaultValue=""
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Vendor / Brand">
          <Input name="vendor" defaultValue="cluxe" />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Toggle name="is_active" defaultChecked={true} label="Active" />
        <Toggle name="is_featured" defaultChecked={false} label="Featured" />
        <Toggle name="is_draft" defaultChecked={false} label="Draft" />
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/inventory")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Creating..." : "Create product"}
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
