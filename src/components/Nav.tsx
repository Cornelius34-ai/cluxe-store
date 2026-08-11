"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchPalette } from "@/components/SearchPalette";
import { useCartStore } from "@/lib/cart-store";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Shop" },
  { href: "/search", label: "Browse" },
];

export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum: number, item) => sum + item.quantity, 0);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd/Ctrl + K to open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Check if current user is admin (client-side, for nav UI)
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-shadow",
          scrolled && "shadow-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">
              <svg
                width="16"
                height="16"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M16 4 L16 28 M12 28 L20 28 M16 12 L8 6 M16 12 L24 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-lg">cluxe</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/inventory"
                className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1">
            {/* Search trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-44 justify-between gap-2 text-muted-foreground sm:flex"
              aria-label="Open search"
            >
              <span className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4" />
                Search...
              </span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Account */}
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href="/account">
                <User className="h-4 w-4" />
              </Link>
            </Button>

            {/* Theme toggle */}
            <ThemeToggle className="ml-1 hidden sm:inline-flex" />

            {/* Cart */}
            <Link
              href="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="View cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
