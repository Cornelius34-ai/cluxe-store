// src/types/database.ts additions
// Add these types to the existing file.

export type OrderStatus =
  | "pending" | "paid" | "processing" | "shipped" | "delivered"
  | "completed" | "cancelled" | "refunded";

export type PaymentMethod = "mpesa" | "bank_transfer" | "cod" | "card_on_delivery";

export type PaymentStatus = "awaiting" | "paid" | "failed" | "refunded";

export type Address = {
  id: string;
  user_id: string | null;
  label: string | null;
  full_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country_code: string;
  is_default: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  coupon_id: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_paid_at: string | null;
  shipping_name: string;
  shipping_phone: string | null;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_region: string | null;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  customer_note: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  sku: string;
  title: string;
  variant_label: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  created_at: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  payment_status: string | null;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type CartItemInput = {
  product_id?: string;
  variant_id?: string;
  sku: string;
  title: string;
  variant_label?: string;
  unit_price_cents: number;
  quantity: number;
};

// Payment method display labels + instructions for the confirmation page.
export const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string; icon: string; instructions: (total: string, ref: string) => string }
> = {
  mpesa: {
    label: "M-Pesa",
    icon: "phone",
    instructions: (total, ref) =>
      `Send ${total} via M-Pesa to Till 4567890. Use order number ${ref} as the account reference. We'll confirm once payment lands.`,
  },
  bank_transfer: {
    label: "Bank transfer",
    icon: "bank",
    instructions: (total, ref) =>
      `Bank: Equity Bank · Account: 1234567890 · Name: cluxe ltd · Amount: ${total}. Use order number ${ref} as the reference. Transfers clear in 1-2 business days.`,
  },
  cod: {
    label: "Cash on delivery",
    icon: "truck",
    instructions: (total, ref) =>
      `Pay ${total} in cash when your order is delivered. Order number: ${ref}.`,
  },
  card_on_delivery: {
    label: "Card on delivery",
    icon: "card",
    instructions: (total, ref) =>
      `Pay ${total} by card (mobile POS) at your door. Order number: ${ref}.`,
  },
};
