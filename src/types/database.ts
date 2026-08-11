// src/types/database.ts
// Mirror the schema exactly. Update this when schema changes.

export type Category = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  retail_price_cents: number;
  compare_at_cents: number | null;
  cost_cents: number | null;
  currency: string;
  stock: number;
  low_stock_threshold: number;
  weight_grams: number | null;
  is_featured: boolean;
  is_active: boolean;
  is_draft: boolean;
  vendor: string | null;
  barcode: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_cover: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  option1_name: string;
  option1_value: string;
  option2_name: string;
  option2_value: string;
  price_cents: number | null;
  stock: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type StockMovement = {
  id: string;
  product_id: string;
  variant_id: string | null;
  delta: number;
  reason: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
};

export type Discount = {
  id: string;
  name: string;
  description: string | null;
  type: "percent" | "fixed";
  value: number;
  scope: "site" | "category" | "product";
  category_id: string | null;
  product_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_id: string;
  max_uses: number | null;
  max_uses_per_user: number;
  min_order_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type CouponRedemption = {
  id: string;
  coupon_id: string;
  user_id: string | null;
  order_id: string | null;
  discount_cents: number;
  redeemed_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

// Helper: format cents as a localized price string
export function formatPriceCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
