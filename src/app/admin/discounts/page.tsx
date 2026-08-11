import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Tag } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getDiscountsAdmin, getCategories, getAllProductsAdmin } from "@/lib/supabase/queries";
import { DiscountForm } from "@/components/DiscountForm";
import { DiscountsList } from "@/components/DiscountsList";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = { title: "Discounts — cluxe admin" };

export default async function AdminDiscountsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/discounts");
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
      </main>
    );
  }

  const [discounts, categories, products] = await Promise.all([
    getDiscountsAdmin(),
    getCategories(),
    getAllProductsAdmin(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Reveal>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Inventory
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Discounts</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Create site-wide, category, or product discounts. Optionally attach a coupon code.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <Reveal delay={0.05} className="lg:col-span-2">
          <DiscountForm categories={categories} products={products} />
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <DiscountsList discounts={discounts} />
        </Reveal>
      </div>
    </main>
  );
}
