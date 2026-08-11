// src/lib/supabase/orders.ts
// Order queries for storefront and admin.

import { createClient } from "./server";
import { getCurrentUser } from "./auth";
import type { Order, OrderItem, OrderStatusHistory } from "@/types/orders";

// ======================================================================
// STOREFRONT — customer order history
// ======================================================================
export async function getMyOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { console.error("getMyOrders error:", error); return []; }
    return (orders ?? []) as (Order & { items: OrderItem[] })[];
  } catch (e) {
    console.error("getMyOrders unavailable:", e);
    return [];
  }
}

export async function getMyOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), order_status_history(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) { console.error("getMyOrder error:", error); return null; }
    return (data ?? null) as (Order & { items: OrderItem[] }) | null;
  } catch (e) {
    console.error("getMyOrder unavailable:", e);
    return null;
  }
}

// ======================================================================
// ADMIN — all orders
// ======================================================================
export async function getAllOrdersAdmin(): Promise<(Order & { items: OrderItem[] })[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) { console.error("getAllOrdersAdmin error:", error); return []; }
    return (data ?? []) as (Order & { items: OrderItem[] })[];
  } catch (e) {
    console.error("getAllOrdersAdmin unavailable:", e);
    return [];
  }
}

export async function getAdminOrder(id: string): Promise<
  (Order & { items: OrderItem[]; history: OrderStatusHistory[] }) | null
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), order_status_history(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) { console.error("getAdminOrder error:", error); return null; }
    return (data ?? null) as (Order & { items: OrderItem[]; history: OrderStatusHistory[] }) | null;
  } catch (e) {
    console.error("getAdminOrder unavailable:", e);
    return null;
  }
}
