"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { isCurrentUserAdmin } from "./auth";

type UpdateStockResult =
  | { ok: true; newStock: number }
  | { ok: false; error: string };

export async function updateProductStock(
  productId: string,
  newStock: number,
  note?: string
): Promise<UpdateStockResult> {
  if (!Number.isInteger(newStock) || newStock < 0) {
    return { ok: false, error: "Stock must be a non-negative integer" };
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return { ok: false, error: "Admin only" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("update_product_stock", {
      p_product_id: productId,
      p_new_stock: newStock,
      p_note: note ?? null,
    });
    if (error) {
      console.error("updateProductStock error:", error);
      return { ok: false, error: error.message };
    }
    // Revalidate customer-facing pages so the new stock shows up
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/search");
    revalidatePath(`/product/${(data as { slug: string }).slug}`);
    return { ok: true, newStock: (data as { stock: number }).stock };
  } catch (e) {
    console.error("updateProductStock unavailable:", e);
    return { ok: false, error: (e as Error).message ?? "Unknown error" };
  }
}
