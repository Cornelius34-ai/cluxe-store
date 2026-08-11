import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, X } from "lucide-react";

export default function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartCount = items.reduce((sum: number, item) => sum + item.quantity, 0);

  return (
    <aside
      className="fixed right-0 top-0 z-50 flex w-80 max-h-screen flex-col overflow-y-auto bg-background border-l"
    >
      <div className="flex flex-col h-full px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
          <button
            onClick={clearCart}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>

        {cartCount === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="flex-overflow overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-start gap-4 pb-4">
                  {/* Placeholder for product image */}
                  <div className="flex-shrink-0 h-16 w-16 bg-muted rounded">
                    {/* We'll replace this with actual product image later */}
                    <span className="text-muted-foreground text-sm flex h-full w-full items-center justify-center">
                      IMG
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2">
                      Product {item.productId}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // We'll implement removeItem later, for now just decrease by 1
                      const store = useCartStore.getState();
                      if (item.quantity > 1) {
                        store.updateQuantity(item.productId, item.quantity - 1);
                      } else {
                        store.removeItem(item.productId);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  Subtotal:
                </span>
                <span className="text-sm font-medium text-foreground">
                  ${(cartCount * 10).toFixed(2)} {/* Placeholder */}
                </span>
              </div>
              <button
                onClick={() => {
                  // We'll implement checkout later
                  alert("Checkout not implemented yet");
                }}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}