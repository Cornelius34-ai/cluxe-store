// src/lib/supabase/queries.ts
// Typed data fetchers. Server-side only (uses createClient from server.ts).
// Add new fetchers as features get wired.

import { createClient } from "./server";
import type { Category, Product } from "@/types/database";

/**
 * Fetch all categories ordered by display_order.
 * Returns [] on any error (missing env vars, network, etc.) so the page
 * can render an empty state instead of crashing.
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
      return [];
    }
    return (data ?? []) as Category[];
  } catch (e) {
    // Missing env vars throw from createClient. Treat as empty state.
    console.error("getCategories unavailable:", e);
    return [];
  }
}

/**
 * Fetch featured products for the home page.
 * Returns [] on any error.
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
      return [];
    }
    return (data ?? []) as Product[];
  } catch (e) {
    console.error("getFeaturedProducts unavailable:", e);
    return [];
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

    if (!category) return [];

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
