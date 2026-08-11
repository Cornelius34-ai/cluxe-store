import Link from "next/link";
import { getCategories } from "@/lib/supabase/queries";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories — cluxe",
  description: "Browse all product categories at cluxe.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <Reveal>
        <h1 className="text-4xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {categories.length === 0
            ? "No categories yet"
            : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
        </p>
      </Reveal>

      {categories.length === 0 ? (
        <div className="mt-12 rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No categories yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.05}>
              <Link
                href={`/category/${category.slug}`}
                className="group block overflow-hidden rounded-lg border bg-card p-8 transition-colors hover:bg-accent"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Collection
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {category.name}
                </div>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground">
                  Browse {category.name.toLowerCase()} →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
