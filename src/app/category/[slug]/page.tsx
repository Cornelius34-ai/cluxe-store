export const dynamic = "force-dynamic";

export const metadata = {
  title: "Category",
  description: "Browse products in this category",
};

export default function CategoryPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Category Name
        </h1>
        <p className="text-muted-foreground mb-8">
          No products available yet. Wire up Supabase to populate the catalog.
        </p>
      </div>
    </section>
  );
}