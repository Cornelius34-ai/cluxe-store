export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product",
  description: "View product details",
};

export default function ProductPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Product Name
        </h1>
        <p className="text-muted-foreground mb-8">
          No product data available yet. Wire up Supabase to populate the catalog.
        </p>
      </div>
    </section>
  );
}