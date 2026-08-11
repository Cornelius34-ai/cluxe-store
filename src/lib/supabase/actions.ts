"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import { isCurrentUserAdmin } from "./auth";
import type { Discount, Product, ProductVariant } from "@/types/database";

// ======================================================================
// RESULT TYPE
// ======================================================================
type Result<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ======================================================================
// PRODUCT: create / update
// ======================================================================
export async function createProduct(formData: FormData): Promise<Result<{ id: string }>> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const retail_price_cents = Number(formData.get("retail_price_cents") ?? 0);
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "") || null;
  const compare_at_cents = Number(formData.get("compare_at_cents") ?? 0) || null;
  const cost_cents = Number(formData.get("cost_cents") ?? 0) || null;
  const stock = Number(formData.get("stock") ?? 0);
  const low_stock_threshold = Number(formData.get("low_stock_threshold") ?? 5);
  const weight_grams = Number(formData.get("weight_grams") ?? 0) || null;
  const is_featured = formData.get("is_featured") === "on";
  const is_active = formData.get("is_active") === "on";
  const is_draft = formData.get("is_draft") === "on";
  const vendor = String(formData.get("vendor") ?? "") || null;
  const barcode = String(formData.get("barcode") ?? "") || null;

  if (!title) return { ok: false, error: "Title is required" };
  if (!slug) return { ok: false, error: "Slug is required" };
  if (!Number.isInteger(retail_price_cents) || retail_price_cents < 0)
    return { ok: false, error: "Price must be a non-negative integer (cents)" };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        title, slug,
        retail_price_cents,
        currency: "USD",
        description, category_id, compare_at_cents, cost_cents,
        stock, low_stock_threshold, weight_grams,
        is_featured, is_active, is_draft,
        vendor, barcode,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inventory");
    revalidatePath("/");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateProduct(productId: string, formData: FormData): Promise<Result> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };

  const updates: Record<string, unknown> = {};
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const retail_price_cents = Number(formData.get("retail_price_cents") ?? 0);

  if (!title) return { ok: false, error: "Title is required" };
  if (!slug) return { ok: false, error: "Slug is required" };
  if (!Number.isInteger(retail_price_cents) || retail_price_cents < 0)
    return { ok: false, error: "Price must be a non-negative integer (cents)" };

  updates.title = title;
  updates.slug = slug;
  updates.retail_price_cents = retail_price_cents;
  updates.description = String(formData.get("description") ?? "") || null;
  updates.category_id = String(formData.get("category_id") ?? "") || null;
  updates.compare_at_cents = Number(formData.get("compare_at_cents") ?? 0) || null;
  updates.cost_cents = Number(formData.get("cost_cents") ?? 0) || null;
  updates.stock = Number(formData.get("stock") ?? 0);
  updates.low_stock_threshold = Number(formData.get("low_stock_threshold") ?? 5);
  updates.weight_grams = Number(formData.get("weight_grams") ?? 0) || null;
  updates.is_featured = formData.get("is_featured") === "on";
  updates.is_active = formData.get("is_active") === "on";
  updates.is_draft = formData.get("is_draft") === "on";
  updates.vendor = String(formData.get("vendor") ?? "") || null;
  updates.barcode = String(formData.get("barcode") ?? "") || null;
  updates.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").update(updates).eq("id", productId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${productId}`);
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/search");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteProduct(productId: string): Promise<Result> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inventory");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ======================================================================
// VARIANTS
// ======================================================================
export async function createVariant(
  productId: string,
  formData: FormData
): Promise<Result<{ id: string }>> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };

  const sku = String(formData.get("sku") ?? "").trim();
  const option1_value = String(formData.get("option1_value") ?? "").trim();
  const option2_value = String(formData.get("option2_value") ?? "").trim();

  if (!sku) return { ok: false, error: "SKU is required" };
  if (!option1_value) return { ok: false, error: "Size is required" };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        sku,
        option1_name: "Size",
        option1_value,
        option2_name: "Color",
        option2_value,
        price_cents: Number(formData.get("price_cents") ?? 0) || null,
        stock: Number(formData.get("stock") ?? 0),
        is_active: true,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/inventory/${productId}`);
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateVariantStock(
  variantId: string,
  newStock: number,
  note?: string
): Promise<Result<{ stock: number }>> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };
  if (!Number.isInteger(newStock) || newStock < 0)
    return { ok: false, error: "Stock must be a non-negative integer" };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_update_variant_stock", {
      p_variant_id: variantId,
      p_new_stock: newStock,
      p_note: note ?? null,
    });
    if (error) return { ok: false, error: error.message };
    const row = data as ProductVariant;
    return { ok: true, data: { stock: row.stock } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteVariant(variantId: string): Promise<Result> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ======================================================================
// PRODUCT STOCK (no variants)
// ======================================================================
export async function updateProductStock(
  productId: string,
  newStock: number,
  note?: string
): Promise<Result<{ newStock: number }>> {
  if (!Number.isInteger(newStock) || newStock < 0) {
    return { ok: false, error: "Stock must be a non-negative integer" };
  }
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { ok: false, error: "Admin only" };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("update_product_stock", {
      p_product_id: productId,
      p_new_stock: newStock,
      p_note: note ?? null,
    });
    if (error) return { ok: false, error: error.message };
    const row = data as Product;
    revalidatePath("/");
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${productId}`);
    return { ok: true, data: { newStock: row.stock } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ======================================================================
// DISCOUNTS + COUPONS
// ======================================================================
export async function createDiscount(formData: FormData): Promise<Result<{ id: string }>> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const value = Number(formData.get("value") ?? 0);
  const scope = String(formData.get("scope") ?? "site");
  const starts_at_raw = String(formData.get("starts_at") ?? "").trim();
  const ends_at_raw = String(formData.get("ends_at") ?? "").trim();
  const coupon_code = String(formData.get("coupon_code") ?? "").trim().toUpperCase();
  const max_uses_raw = String(formData.get("max_uses") ?? "").trim();
  const min_order_dollars = Number(formData.get("min_order") ?? 0);

  if (!name) return { ok: false, error: "Name is required" };
  if (!["percent", "fixed"].includes(type)) return { ok: false, error: "Type must be percent or fixed" };
  if (!Number.isInteger(value) || value <= 0) return { ok: false, error: "Value must be a positive integer" };
  if (!["site", "category", "product"].includes(scope)) return { ok: false, error: "Scope must be site/category/product" };
  if (type === "percent" && (value < 1 || value > 100)) return { ok: false, error: "Percent must be 1-100" };

  try {
    const supabase = await createClient();
    const starts_at = starts_at_raw ? new Date(starts_at_raw).toISOString() : null;
    const ends_at = ends_at_raw ? new Date(ends_at_raw).toISOString() : null;
    const max_uses = max_uses_raw ? Number(max_uses_raw) : null;
    const min_order_cents = Math.round(min_order_dollars * 100);

    const { data, error } = await supabase.rpc("admin_create_discount", {
      p_name: name,
      p_type: type,
      p_value: value,
      p_scope: scope,
      p_starts_at: starts_at,
      p_ends_at: ends_at,
      p_coupon_code: coupon_code || null,
      p_max_uses: max_uses,
      p_min_order_cents: min_order_cents,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/discounts");
    revalidatePath("/admin/coupons");
    return { ok: true, data: { id: (data as Discount).id } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleDiscountActive(discountId: string, isActive: boolean): Promise<Result> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("discounts").update({ is_active: isActive }).eq("id", discountId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/discounts");
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteDiscount(discountId: string): Promise<Result> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("discounts").delete().eq("id", discountId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/discounts");
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
