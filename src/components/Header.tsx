import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum: number, item) => sum + item.quantity, 0);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/images/logo.svg"
            alt="cluxe logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-foreground">cluxe</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          <Link href="/search" className="text-muted-foreground hover:text-foreground">
            Search
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/cart"
            className="relative group"
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}