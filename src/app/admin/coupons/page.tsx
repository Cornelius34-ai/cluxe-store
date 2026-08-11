import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Ticket } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { getCouponsAdmin } from "@/lib/supabase/queries";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = { title: "Coupons — cluxe admin" };

export default async function AdminCouponsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/coupons");
  if (!profile.is_admin) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
      </main>
    );
  }

  const coupons = await getCouponsAdmin();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Reveal>
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Discounts
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Coupons</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          All coupon codes linked to discounts. Create new ones from the Discounts page.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Code</div>
            <div className="col-span-3">Discount</div>
            <div className="col-span-2">Window</div>
            <div className="col-span-2">Min order</div>
            <div className="col-span-2 text-right">Uses</div>
          </div>
          {coupons.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              <Ticket className="mx-auto mb-2 h-8 w-8 opacity-30" />
              No coupons yet. Add one when creating a discount.
            </div>
          ) : (
            coupons.map((c) => (
              <div key={c.id} className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0">
                <div className="col-span-3">
                  <div className="font-mono font-medium">{c.code}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.max_uses_per_user} per user
                  </div>
                </div>
                <div className="col-span-3">
                  {c.discount ? (
                    <div>
                      <div className="truncate">{c.discount.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.discount.type === "percent" ? `${c.discount.value}% off` : `$${(c.discount.value / 100).toFixed(2)} off`}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {c.starts_at && new Date(c.starts_at).toLocaleDateString()}
                  {c.starts_at && " → "}
                  {c.ends_at ? new Date(c.ends_at).toLocaleDateString() : "∞"}
                </div>
                <div className="col-span-2 text-xs">
                  {c.min_order_cents > 0 ? `$${(c.min_order_cents / 100).toFixed(2)}` : "—"}
                </div>
                <div className="col-span-2 text-right tabular-nums">
                  {c.uses}
                  {c.max_uses != null && <span className="text-xs text-muted-foreground"> / {c.max_uses}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </Reveal>
    </main>
  );
}
