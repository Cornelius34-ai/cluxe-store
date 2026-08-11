import { CheckoutForm } from "@/components/CheckoutForm";
import { getCurrentProfile } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — cluxe",
  description: "Complete your order.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ discount?: string; coupon?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const appliedDiscountCents = Number(params.discount ?? 0);
  const appliedCouponId = params.coupon || null;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill in your details and choose how to pay.
      </p>

      <div className="mt-8">
        <CheckoutForm
          defaultEmail={profile?.email ?? ""}
          unitPriceCents={4500}
          appliedDiscountCents={appliedDiscountCents}
          appliedCouponId={appliedCouponId}
        />
      </div>
    </main>
  );
}
