import { NextRequest, NextResponse } from "next/server";
import { getCategories, getFeaturedProducts } from "@/lib/supabase/queries";

type Suggestion = {
  type: "product" | "category";
  slug: string;
  title: string;
  subtitle?: string;
};

// Lightweight in-process cache so repeated keystrokes don't hit Supabase every time.
let cache: { data: Suggestion[]; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function buildIndex(): Promise<Suggestion[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return cache.data;

  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(50),
  ]);

  const out: Suggestion[] = [
    ...categories.map((c) => ({
      type: "category" as const,
      slug: c.slug,
      title: c.name,
      subtitle: "Category",
    })),
    ...products.map((p) => ({
      type: "product" as const,
      slug: p.slug,
      title: p.title,
      subtitle: `$${(p.retail_price_cents / 100).toFixed(2)}`,
    })),
  ];

  cache = { data: out, ts: Date.now() };
  return out;
}

function score(s: Suggestion, q: string): number {
  const ql = q.toLowerCase();
  const t = s.title.toLowerCase();
  if (t === ql) return 1000;
  if (t.startsWith(ql)) return 500;
  if (t.includes(ql)) return 100;
  return 0;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const index = await buildIndex();
  const ranked = index
    .map((s) => ({ s, sc: score(s, q) }))
    .filter((r) => r.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 8)
    .map((r) => r.s);

  return NextResponse.json({ results: ranked });
}
