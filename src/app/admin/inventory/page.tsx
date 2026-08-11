import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Plus, Package } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getAllProductsAdmin, getCategories } from "@/lib/supabase/queries";
import { formatPriceCents } from "@/types/database";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory — cluxe admin",
  description: "Manage products, variants, and stock.",
};

export default async function AdminInventoryPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?next=/admin/inventory");
  }
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          This area is for site administrators only.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-foreground underline">
          Back to home
        </Link>
      </main>
    );
  }

  const [products, categories] = await Promise.all([
    getAllProductsAdmin(),
    getCategories(),
  ]);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0 && !p.is_draft && p.is_active).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.low_stock_threshold && !p.is_draft && p.is_active
  ).length;
  const drafts = products.filter((p) => p.is_draft).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <Link
            href="/admin/inventory/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Products
            </div>
            <div className="mt-1 text-2xl font-semibold">{products.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total stock
            </div>
            <div className="mt-1 text-2xl font-semibold">{totalStock}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Out / Low
            </div>
            <div
              className={`mt-1 text-2xl font-semibold ${
                outOfStock > 0 ? "text-destructive" : lowStock > 0 ? "text-amber-600" : ""
              }`}
            >
              {outOfStock + lowStock}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Drafts
            </div>
            <div className="mt-1 text-2xl font-semibold">{drafts}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1 text-center">Stock</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          {products.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
              No products yet. Click "New product" to add your first.
            </div>
          ) : (
            products.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              const status = p.is_draft
                ? "Draft"
                : !p.is_active
                  ? "Hidden"
                  : p.stock === 0
                    ? "Sold out"
                    : p.stock <= p.low_stock_threshold
                      ? "Low"
                      : "Active";
              const statusClass = {
                Draft: "bg-muted text-muted-foreground",
                Hidden: "bg-muted text-muted-foreground",
                "Sold out": "bg-destructive/10 text-destructive",
                Low: "bg-amber-100 text-amber-800",
                Active: "bg-emerald-100 text-emerald-800",
              }[status];

              return (
                <Link
                  key={p.id}
                  href={`/admin/inventory/${p.id}`}
                  className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0 transition-colors hover:bg-accent"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      /{p.slug}
                      {cat && ` · ${cat.name}`}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">
                    {formatPriceCents(p.retail_price_cents, p.currency)}
                    {p.compare_at_cents != null && p.compare_at_cents > p.retail_price_cents && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {formatPriceCents(p.compare_at_cents, p.currency)}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 text-center text-sm tabular-nums">
                    {p.stock}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                      {status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-muted-foreground">
                    Edit →
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Reveal>
    </main>
  );
}
