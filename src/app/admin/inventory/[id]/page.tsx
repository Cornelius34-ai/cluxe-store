import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import {
  getProductAdmin,
  getProductVariants,
  getStockMovements,
  getCategories,
  getDiscountsForProduct,
} from "@/lib/supabase/queries";
import { ProductEditForm } from "@/components/ProductEditForm";
import { ProductEditTabs } from "@/components/ProductEditTabs";
import { ProductDiscounts } from "@/components/ProductDiscounts";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function AdminProductEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile) redirect(`/login?next=/admin/inventory/${id}`);
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          Back to home
        </Link>
      </main>
    );
  }

  const [product, variants, movements, categories, discounts] = await Promise.all([
    getProductAdmin(id),
    getProductVariants(id),
    getStockMovements(id, 50),
    getCategories(),
    Promise.resolve(null as never),
  ]);

  // getDiscountsForProduct needs category_id which we don't know until product loads
  const productDiscounts = product
    ? await getDiscountsForProduct(product.id, product.category_id)
    : [];

  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Inventory
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{product.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          /{product.slug} · created {new Date(product.created_at).toLocaleDateString()}
        </p>
      </Reveal>

      <div className="mt-8 space-y-8">
        <Reveal>
          <ProductEditForm product={product} categories={categories} />
        </Reveal>

        <Reveal delay={0.05}>
          <ProductEditTabs
            productId={product.id}
            variants={variants}
            movements={movements}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <ProductDiscounts productId={product.id} discounts={productDiscounts} />
        </Reveal>
      </div>
    </main>
  );
}
