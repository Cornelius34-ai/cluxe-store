export const metadata = {
  title: "Categories",
  description: "Browse all product categories",
};

export default function CategoriesPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Categories
        </h1>
        <p className="text-muted-foreground mb-8">
          No categories available yet. Wire up Supabase to populate the catalog.
        </p>
      </div>
    </section>
  );
}