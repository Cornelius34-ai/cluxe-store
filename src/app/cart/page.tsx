export const metadata = {
  title: "Cart",
  description: "Your shopping cart",
};

export default function CartPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Cart
        </h1>
        <p className="text-muted-foreground">
          Your cart is empty.
        </p>
      </div>
    </section>
  );
}