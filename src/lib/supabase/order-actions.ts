"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import { isCurrentUserAdmin, getCurrentUser } from "./auth";
import type { Order } from "@/types/orders";
import type { CartItemInput } from "@/types/orders";

type Result<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Create an order from the cart.
 * Cart items, shipping info, payment method, and (optional) coupon go in.
 * Returns the new order_id; the caller redirects to the success page.
 */
export async function createOrderFromCart(input: {
  email: string;
  shipping: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
  items: CartItemInput[];
  subtotal_cents: number;
  discount_cents: number;
  coupon_id?: string | null;
  payment_method: "mpesa" | "bank_transfer" | "cod" | "card_on_delivery";
  customer_note?: string;
}): Promise<Result<{ order_id: string; order_number: string }>> {
  if (!input.email || !input.shipping.name || !input.shipping.line1 || !input.shipping.city) {
    return { ok: false, error: "Please fill in all required fields" };
  }
  if (!input.items.length) return { ok: false, error: "Cart is empty" };
  if (input.subtotal_cents <= 0) return { ok: false, error: "Invalid cart total" };

  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const itemsJson = input.items.map((i) => ({
      product_id: i.product_id ?? "",
      variant_id: i.variant_id ?? "",
      sku: i.sku,
      title: i.title,
      variant_label: i.variant_label ?? null,
      unit_price_cents: i.unit_price_cents,
      quantity: i.quantity,
    }));

    const { data, error } = await supabase.rpc("create_order", {
      p_email: input.email,
      p_shipping_name: input.shipping.name,
      p_shipping_phone: input.shipping.phone || "",
      p_shipping_line1: input.shipping.line1,
      p_shipping_line2: input.shipping.line2 || "",
      p_shipping_city: input.shipping.city,
      p_shipping_region: input.shipping.region || "",
      p_shipping_postal: input.shipping.postal_code,
      p_shipping_country: input.shipping.country || "KE",
      p_items: itemsJson,
      p_coupon_id: input.coupon_id || null,
      p_discount_cents: input.discount_cents,
      p_payment_method: input.payment_method,
      p_customer_note: input.customer_note || null,
    });
    if (error) return { ok: false, error: error.message };
    const order = data as Order;
    return {
      ok: true,
      data: { order_id: order.id, order_number: order.order_number },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function markOrderPaid(
  orderId: string,
  paymentReference?: string
): Promise<Result> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_mark_order_paid", {
      p_order_id: orderId,
      p_payment_reference: paymentReference || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "refunded",
  options: { note?: string; carrier?: string; tracking?: string; tracking_url?: string } = {}
): Promise<Result> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { ok: false, error: "Admin only" };
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_to_status: status,
      p_note: options.note || null,
      p_carrier: options.carrier || null,
      p_tracking: options.tracking || null,
      p_tracking_url: options.tracking_url || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
