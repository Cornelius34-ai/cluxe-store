import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getCategories } from "@/lib/supabase/queries";
import { NewProductForm } from "@/components/NewProductForm";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = { title: "New product — cluxe admin" };

export default async function NewProductPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/inventory/new");
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <Link href="/" className="mt-6 inline-block text-sm underline">Back to home</Link>
      </main>
    );
  }

  const categories = await getCategories();

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
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">New product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new product. You can add variants (size × color) after saving.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8">
          <NewProductForm categories={categories} />
        </div>
      </Reveal>
    </main>
  );
}
