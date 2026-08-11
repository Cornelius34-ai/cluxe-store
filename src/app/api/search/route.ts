import { NextRequest, NextResponse } from "next/server";
import { buildSearchIndex, searchSuggestions } from "@/lib/search-index";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const index = await buildSearchIndex();
  const results = searchSuggestions(index, q, 8);
  return NextResponse.json({ results });
}
