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
            aria-label="cluxe home"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <svg
              width="180"
              height="32"
              viewBox="0 0 180 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-auto"
              aria-hidden
            >
              {/* Mark: C with horizontal hanger rod */}
              <g transform="translate(2, 0)" fill="currentColor">
                <path d="M 24 4 A 12 12 0 1 0 24 28 L 24 24.5 A 8.5 8.5 0 1 1 24 7.5 Z" />
                <line
                  x1="24" y1="16" x2="32" y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
              {/* Wordmark: CLUXE in custom geometric letterforms */}
              <g transform="translate(44, 0)" fill="currentColor">
                <path d="M 8 7 A 9 9 0 1 0 8 25 L 8 22 A 6 6 0 1 1 8 10 Z" />
                <path d="M 20 6 H 23 V 23 H 32 V 26 H 20 Z" />
                <path d="M 40 6 H 43 V 20 A 3.5 3.5 0 0 0 50 20 V 6 H 53 V 20 A 6.5 6.5 0 0 1 40 20 Z" />
                <path d="M 61 6 H 64 L 69.5 13 L 75 6 H 78 L 71 14.8 L 78.5 24 V 26 H 75.5 L 69.5 18.6 L 63.5 26 H 60.5 V 24 L 68 14.8 Z" />
                <path d="M 86 6 H 99 V 9 H 89 V 14.5 H 97 V 17.5 H 89 V 23 H 99 V 26 H 86 Z" />
              </g>
            </svg>
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
