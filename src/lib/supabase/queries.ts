// src/lib/supabase/queries.ts
// Typed data fetchers. Server-side only.
//
// Mock fallback: each fetcher returns mock data if Supabase returns nothing
// or errors. This keeps the UI populated while the database is being set up.

import { createClient } from "./server";
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Discount,
  Coupon,
  StockMovement,
} from "@/types/database";

const useMock = (): boolean => {
  if (typeof process !== "undefined") {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
  }
  return true;
};

// --- Mock data ---
const MOCK_CATEGORIES: Category[] = [
  { id: "mock-cat-1", slug: "mens", name: "Mens", image_url: null, display_order: 1, created_at: new Date().toISOString() },
  { id: "mock-cat-2", slug: "womens", name: "Womens", image_url: null, display_order: 2, created_at: new Date().toISOString() },
  { id: "mock-cat-3", slug: "accessories", name: "Accessories", image_url: null, display_order: 3, created_at: new Date().toISOString() },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-prod-1", slug: "oversized-tee", title: "Oversized Cotton Tee",
    description: "Premium heavyweight cotton, relaxed fit.",
    category_id: "mock-cat-1", retail_price_cents: 4500, compare_at_cents: 6000,
    cost_cents: 1500, currency: "USD", stock: 24, low_stock_threshold: 5,
    weight_grams: 220, is_featured: true, is_active: true, is_draft: false,
    vendor: "cluxe", barcode: null, rating_avg: 4.6, rating_count: 38,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-2", slug: "wide-leg-trouser", title: "Wide-Leg Trouser",
    description: "Tailored wide-leg, soft drape.",
    category_id: "mock-cat-1", retail_price_cents: 9800, compare_at_cents: null,
    cost_cents: 3200, currency: "USD", stock: 12, low_stock_threshold: 5,
    weight_grams: 480, is_featured: true, is_active: true, is_draft: false,
    vendor: "cluxe", barcode: null, rating_avg: 4.8, rating_count: 22,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-3", slug: "silk-camisole", title: "Silk Camisole",
    description: "100% mulberry silk, adjustable straps.",
    category_id: "mock-cat-2", retail_price_cents: 12500, compare_at_cents: 15000,
    cost_cents: 4200, currency: "USD", stock: 8, low_stock_threshold: 5,
    weight_grams: 120, is_featured: true, is_active: true, is_draft: false,
    vendor: "cluxe", barcode: null, rating_avg: 4.9, rating_count: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-prod-4", slug: "leather-tote", title: "Leather Tote",
    description: "Full-grain leather, hand-stitched.",
    category_id: "mock-cat-3", retail_price_cents: 22500, compare_at_cents: null,
    cost_cents: 7800, currency: "USD", stock: 5, low_stock_threshold: 5,
    weight_grams: 650, is_featured: true, is_active: true, is_draft: false,
    vendor: "cluxe", barcode: null, rating_avg: 4.7, rating_count: 9,
    created_at: new Date().toISOString(),
  },
];

// ======================================================================
// CATEGORIES
// ======================================================================
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, image_url, display_order, created_at")
      .order("display_order", { ascending: true });
    if (error) { console.error("getCategories error:", error); return useMock() ? MOCK_CATEGORIES : []; }
    const rows = (data ?? []) as Category[];
    if (rows.length === 0 && useMock()) return MOCK_CATEGORIES;
    return rows;
  } catch (e) { console.error("getCategories unavailable:", e); return useMock() ? MOCK_CATEGORIES : []; }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, image_url, display_order, created_at")
      .eq("slug", slug).maybeSingle();
    if (error) { console.error("getCategoryBySlug error:", error); return useMock() ? (MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null) : null; }
    return (data ?? null) as Category | null;
  } catch (e) { console.error("getCategoryBySlug unavailable:", e); return useMock() ? (MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null) : null; }
}

// ======================================================================
// PRODUCTS
// ======================================================================
const PRODUCT_SELECT =
  "id, slug, title, description, category_id, retail_price_cents, compare_at_cents, cost_cents, currency, stock, low_stock_threshold, weight_grams, is_featured, is_active, is_draft, vendor, barcode, rating_avg, rating_count, created_at";

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products").select(PRODUCT_SELECT)
      .eq("is_featured", true).eq("is_active", true).eq("is_draft", false)
      .order("created_at", { ascending: false }).limit(limit);
    if (error) { console.error("getFeaturedProducts error:", error); return useMock() ? MOCK_PRODUCTS.slice(0, limit) : []; }
    const rows = (data ?? []) as Product[];
    if (rows.length === 0 && useMock()) return MOCK_PRODUCTS.slice(0, limit);
    return rows;
  } catch (e) { console.error("getFeaturedProducts unavailable:", e); return useMock() ? MOCK_PRODUCTS.slice(0, limit) : []; }
}

export async function getProductsByCategory(categorySlug: string, limit = 24): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data: category } = await supabase
      .from("categories").select("id").eq("slug", categorySlug).single();
    if (!category) {
      return useMock()
        ? MOCK_PRODUCTS.filter((p) => p.category_id === `mock-cat-${["mens","womens","accessories"].indexOf(categorySlug) + 1}`)
        : [];
    }
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT)
      .eq("category_id", category.id).eq("is_active", true).eq("is_draft", false)
      .order("created_at", { ascending: false }).limit(limit);
    if (error) { console.error("getProductsByCategory error:", error); return []; }
    return (data ?? []) as Product[];
  } catch (e) { console.error("getProductsByCategory unavailable:", e); return []; }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT)
      .eq("slug", slug).eq("is_active", true).eq("is_draft", false).maybeSingle();
    if (error) { console.error("getProductBySlug error:", error); return null; }
    return (data ?? null) as Product | null;
  } catch (e) { console.error("getProductBySlug unavailable:", e); return null; }
}

// ======================================================================
// ADMIN QUERIES (no mock fallback — admin needs the truth)
// ======================================================================
export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT)
      .order("title", { ascending: true });
    if (error) { console.error("getAllProductsAdmin error:", error); return []; }
    return (data ?? []) as Product[];
  } catch (e) { console.error("getAllProductsAdmin unavailable:", e); return []; }
}

export async function getProductAdmin(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT)
      .eq("id", id).maybeSingle();
    if (error) { console.error("getProductAdmin error:", error); return null; }
    return (data ?? null) as Product | null;
  } catch (e) { console.error("getProductAdmin unavailable:", e); return null; }
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("product_variants").select("*")
      .eq("product_id", productId).order("display_order", { ascending: true });
    if (error) { console.error("getProductVariants error:", error); return []; }
    return (data ?? []) as ProductVariant[];
  } catch (e) { console.error("getProductVariants unavailable:", e); return []; }
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("product_images").select("*")
      .eq("product_id", productId).order("display_order", { ascending: true });
    if (error) { console.error("getProductImages error:", error); return []; }
    return (data ?? []) as ProductImage[];
  } catch (e) { console.error("getProductImages unavailable:", e); return []; }
}

export async function getStockMovements(productId: string, limit = 30): Promise<StockMovement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("stock_movements").select("*")
      .eq("product_id", productId).order("created_at", { ascending: false }).limit(limit);
    if (error) { console.error("getStockMovements error:", error); return []; }
    return (data ?? []) as StockMovement[];
  } catch (e) { console.error("getStockMovements unavailable:", e); return []; }
}

// ======================================================================
// DISCOUNTS + COUPONS
// ======================================================================
export async function getDiscountsAdmin(): Promise<Discount[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("discounts").select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("getDiscountsAdmin error:", error); return []; }
    return (data ?? []) as Discount[];
  } catch (e) { console.error("getDiscountsAdmin unavailable:", e); return []; }
}

/**
 * Fetch active discounts that apply to a specific product
 * (site-wide + category-scoped if product has a category + product-scoped).
 */
export async function getDiscountsForProduct(productId: string, categoryId: string | null): Promise<Discount[]> {
  try {
    const supabase = await createClient();
    const ors = [`product_id.eq.${productId}`];
    if (categoryId) ors.push(`category_id.eq.${categoryId}`);
    // For site-wide (no product_id, no category_id) — easiest to fetch all and filter
    const { data, error } = await supabase.from("discounts").select("*")
      .or(ors.join(","))
      .eq("is_active", true);
    if (error) { console.error("getDiscountsForProduct error:", error); return []; }
    const list = (data ?? []) as Discount[];

    const { data: siteWide } = await supabase.from("discounts").select("*")
      .is("product_id", null).is("category_id", null).eq("is_active", true);
    const now = Date.now();
    return [...list, ...((siteWide ?? []) as Discount[])].filter((d) => {
      if (d.starts_at && new Date(d.starts_at).getTime() > now) return false;
      if (d.ends_at && new Date(d.ends_at).getTime() <= now) return false;
      return true;
    });
  } catch (e) { console.error("getDiscountsForProduct unavailable:", e); return []; }
}

export async function getCouponsAdmin(): Promise<(Coupon & { uses: number; discount: Discount | null })[]> {
  try {
    const supabase = await createClient();
    const { data: coupons, error } = await supabase.from("coupons").select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("getCouponsAdmin error:", error); return []; }
    const { data: discounts } = await supabase.from("discounts").select("*");
    const { data: redemptions } = await supabase.from("coupon_redemptions").select("coupon_id");
    const useCount = new Map<string, number>();
    (redemptions ?? []).forEach((r) => {
      useCount.set(r.coupon_id, (useCount.get(r.coupon_id) ?? 0) + 1);
    });
    return (coupons ?? []).map((c) => ({
      ...(c as Coupon),
      uses: useCount.get(c.id) ?? 0,
      discount: (discounts ?? []).find((d) => d.id === c.discount_id) as Discount | null,
    }));
  } catch (e) { console.error("getCouponsAdmin unavailable:", e); return []; }
}
