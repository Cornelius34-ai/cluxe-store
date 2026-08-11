import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  let body: { code?: string; cart_total_cents?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  const cart_total = Number(body.cart_total_cents ?? 0);

  if (!code) return NextResponse.json({ ok: false, error: "Code required" }, { status: 400 });
  if (!Number.isInteger(cart_total) || cart_total < 0) {
    return NextResponse.json({ ok: false, error: "Invalid cart total" }, { status: 400 });
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("apply_coupon", {
    p_code: code,
    p_cart_total: cart_total,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("apply_coupon error:", error);
    return NextResponse.json({ ok: false, error: "Service error" }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.ok) {
    return NextResponse.json({ ok: false, error: row?.error ?? "Invalid coupon" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    coupon_id: row.coupon_id,
    discount_cents: row.discount_cents,
    new_total_cents: row.new_total,
  });
}
