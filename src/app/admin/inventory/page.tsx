import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getAllProductsAdmin } from "@/lib/supabase/queries";
import { InventoryRow } from "@/components/InventoryRow";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory — cluxe admin",
  description: "Manage product stock levels.",
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
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-foreground underline"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const products = await getAllProductsAdmin();
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{profile.email}</span>
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total products
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
              {outOfStock > 0 || lowStock > 0
                ? `${outOfStock} out · ${lowStock} low`
                : "All stocked"}
            </div>
            <div
              className={`mt-1 text-2xl font-semibold ${
                outOfStock > 0
                  ? "text-destructive"
                  : lowStock > 0
                    ? "text-amber-600"
                    : ""
              }`}
            >
              {outOfStock + lowStock}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5">Product</div>
            <div className="col-span-3">Stock</div>
            <div className="col-span-4 text-right">Action</div>
          </div>
          {products.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No products yet.
            </div>
          ) : (
            products.map((p) => <InventoryRow key={p.id} product={p} />)
          )}
        </div>
      </Reveal>
    </main>
  );
}
