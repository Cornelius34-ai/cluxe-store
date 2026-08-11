export const metadata = {
  title: "Search",
  description: "Search products",
};

export default function SearchPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Search
        </h1>
        <p className="text-muted-foreground mb-8">
          No search results yet. Wire up Supabase to populate the catalog.
        </p>
      </div>
    </section>
  );
}