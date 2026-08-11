import { CartView } from "@/components/CartView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cart — cluxe",
  description: "Your shopping cart.",
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </main>
  );
}
