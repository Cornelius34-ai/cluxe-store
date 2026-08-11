import Link from "next/link";
import { Search } from "lucide-react";

import { buildSearchIndex, searchSuggestions } from "@/lib/search-index";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search — cluxe",
  description: "Search products and categories.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const results = query
    ? searchSuggestions(await buildSearchIndex(), query, 24)
    : [];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <h1 className="text-4xl font-semibold tracking-tight">Search</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find products and categories by name.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <form action="/search" method="GET" className="relative mt-8">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products, categories..."
            className={cn(
              "h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
            autoFocus
          />
        </form>
      </Reveal>

      <div className="mt-8">
        {!query && (
          <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
            Type a query above to search the catalog.
          </div>
        )}

        {query && results.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
            No results for &quot;{query}&quot;
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} for &quot;{query}&quot;
            </p>
            <ul className="mt-4 divide-y rounded-lg border bg-card">
              {results.map((r, i) => (
                <Reveal as="li" key={`${r.type}-${r.slug}`} delay={i * 0.03} className="block">
                  <Link
                    href={r.type === "product" ? `/product/${r.slug}` : `/category/${r.slug}`}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium uppercase">
                      {r.type === "product" ? "P" : "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.title}</div>
                      {r.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">
                          {r.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {r.type}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
