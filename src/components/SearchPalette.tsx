import * as React from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Suggestion = {
  type: "product" | "category";
  slug: string;
  title: string;
  subtitle?: string;
};

type SearchPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced fetch
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(query.trim())}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results);
        setActiveIndex(0);
      } catch {
        // aborted, ignore
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      // small delay for the dialog to render
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard nav
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const r = results[activeIndex];
        if (r) {
          const path = r.type === "product" ? `/product/${r.slug}` : `/category/${r.slug}`;
          onOpenChange(false);
          router.push(path);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIndex, onOpenChange, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl rounded-xl border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && query.trim() && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}
          {!query.trim() && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type to search. Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">↑</kbd>{" "}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">↓</kbd> to navigate,{" "}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Enter</kbd> to select.
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.slug}`}
              onClick={() => {
                const path = r.type === "product" ? `/product/${r.slug}` : `/category/${r.slug}`;
                onOpenChange(false);
                router.push(path);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              )}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium uppercase">
                {r.type === "product" ? "P" : "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.title}</div>
                {r.subtitle && (
                  <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
                )}
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {r.type}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
