export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-12">
      <section className="w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to cluxe
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your destination for modern clothing. Wire up Supabase to populate the catalog.
        </p>
      </section>

      {/* Placeholder for future featured products */}
      <section className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Featured
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* We'll map over featured products once we have data */}
          <div className="bg-muted rounded p-6 text-center">
            <span className="text-muted-foreground text-sm">No featured products yet</span>
          </div>
        </div>
      </section>

      {/* Placeholder for future categories */}
      <section className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-muted rounded p-6 text-center">
            <span className="text-muted-foreground text-sm">No categories yet</span>
          </div>
        </div>
      </section>
    </main>
  );
}