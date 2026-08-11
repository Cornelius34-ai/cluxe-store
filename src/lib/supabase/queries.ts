// src/lib/supabase/queries.ts
// Typed data fetchers. Server-side only (uses createClient from server.ts).
// Add new fetchers as features get wired.
//
// Mock fallback: each fetcher returns mock data if Supabase returns nothing
// or errors. This keeps the UI populated while the database is being set up.
// Set NEXT_PUBLIC_USE_MOCK_DATA=false in env to disable and force live only.

import { createClient } from "./server";
import type { Category, Product } from "@/types/database";

const useMock = (): boolean => {
  if (typeof process !== "undefined") {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
  }
  return true;
};

// --- Mock data ---
// Used as fallback when Supabase is empty or unreachable.
const MOCK_CATEGORIES: Category[] = [
  {
    id: "mock-cat-1",
    slug: "mens",
    name: "Mens",
    image_url: null,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-cat-2",
    slug: "womens",
    name: "Womens",
    image_url: null,
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-cat-3",
    slug: "accessories",
    name: "Accessories",
    image_url: null,
    display_order: 3,
    created_at: new Date().toISOString(),
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-prod-1",
    slug: "oversized-tee",
    title: "Oversized Cotton Tee",
    description: "Premium heavyweight cotton, relaxed fit.",
    category_id: "mock-cat-1",
    retail_price_cents: 4500,
    currency: "USD",
    stock: 24,
    is_featured: true,
    is_active: true,
    rating_avg: 4.6,
    rating_count: 38,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-2",
    slug: "wide-leg-trouser",
    title: "Wide-Leg Trouser",
    description: "Tailored wide-leg, soft drape.",
    category_id: "mock-cat-1",
    retail_price_cents: 9800,
    currency: "USD",
    stock: 12,
    is_featured: true,
    is_active: true,
    rating_avg: 4.8,
    rating_count: 22,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-3",
    slug: "silk-camisole",
    title: "Silk Camisole",
    description: "100% mulberry silk, adjustable straps.",
    category_id: "mock-cat-2",
    retail_price_cents: 12500,
    currency: "USD",
    stock: 8,
    is_featured: true,
    is_active: true,
    rating_avg: 4.9,
    rating_count: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-4",
    slug: "leather-tote",
    title: "Leather Tote",
    description: "Full-grain leather, hand-stitched.",
    category_id: "mock-cat-3",
    retail_price_cents: 22500,
    currency: "USD",
    stock: 5,
    is_featured: true,
    is_active: true,
    rating_avg: 4.7,
    rating_count: 9,
    created_at: new Date().toISOString(),
  },
];

/**
 * Fetch all categories ordered by display_order.
 * Falls back to mock data on error or empty result.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, image_url, display_order, created_at")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("getCategories error:", error);
      return useMock() ? MOCK_CATEGORIES : [];
    }
    const rows = (data ?? []) as Category[];
    if (rows.length === 0 && useMock()) return MOCK_CATEGORIES;
    return rows;
  } catch (e) {
    console.error("getCategories unavailable:", e);
    return useMock() ? MOCK_CATEGORIES : [];
  }
}

/**
 * Fetch a single category by its slug.
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, image_url, display_order, created_at")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getCategoryBySlug error:", error);
      return useMock()
        ? (MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null)
        : null;
    }
    return (data ?? null) as Category | null;
  } catch (e) {
    console.error("getCategoryBySlug unavailable:", e);
    return useMock()
      ? (MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null)
      : null;
  }
}

/**
 * Fetch featured products for the home page.
 * Falls back to mock data on error or empty result.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, title, description, category_id, retail_price_cents, currency, stock, is_featured, is_active, rating_avg, rating_count, created_at"
      )
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getFeaturedProducts error:", error);
      return useMock() ? MOCK_PRODUCTS : [];
    }
    const rows = (data ?? []) as Product[];
    if (rows.length === 0 && useMock()) return MOCK_PRODUCTS.slice(0, limit);
    return rows;
  } catch (e) {
    console.error("getFeaturedProducts unavailable:", e);
    return useMock() ? MOCK_PRODUCTS.slice(0, limit) : [];
  }
}

/**
 * Fetch products in a category, with basic pagination.
 */
export async function getProductsByCategory(
  categorySlug: string,
  limit = 24
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (!category) {
      return useMock()
        ? MOCK_PRODUCTS.filter((p) => p.category_id === `mock-cat-${["mens", "womens", "accessories"].indexOf(categorySlug) + 1}`)
        : [];
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, title, description, category_id, retail_price_cents, currency, stock, is_featured, is_active, rating_avg, rating_count, created_at"
      )
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getProductsByCategory error:", error);
      return [];
    }
    return (data ?? []) as Product[];
  } catch (e) {
    console.error("getProductsByCategory unavailable:", e);
    return [];
  }
}

/**
 * Fetch a single product by its slug.
 */
export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, title, description, category_id, retail_price_cents, currency, stock, is_featured, is_active, rating_avg, rating_count, created_at"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("getProductBySlug error:", error);
      return null;
    }
    return (data ?? null) as Product | null;
  } catch (e) {
    console.error("getProductBySlug unavailable:", e);
    return null;
  }
}

/**
 * Fetch all products (admin use). No mock fallback — admin needs the truth.
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, title, description, category_id, retail_price_cents, currency, stock, is_featured, is_active, rating_avg, rating_count, created_at"
      )
      .order("title", { ascending: true });

    if (error) {
      console.error("getAllProductsAdmin error:", error);
      return [];
    }
    return (data ?? []) as Product[];
  } catch (e) {
    console.error("getAllProductsAdmin unavailable:", e);
    return [];
  }
}
