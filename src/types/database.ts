// src/types/database.ts
// Mirror the schema.sql exactly. Update this when schema changes.

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
  currency: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  display_order: number;
  is_cover: boolean;
};

export type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

export type StockAuditLog = {
  id: string;
  product_id: string;
  old_stock: number;
  new_stock: number;
  changed_by: string | null;
  changed_at: string;
  note: string | null;
};

// Helper: format cents as a localized price string
export function formatPriceCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
