import Link from "next/link";
import { LogIn, ShieldCheck, User as UserIcon, Package, LogOut } from "lucide-react";

import { getCurrentProfile } from "@/lib/supabase/auth";
import { Reveal } from "@/components/Reveal";
import { SignOutButton } from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account — cluxe",
  description: "Your account, orders, and preferences.",
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-md px-6 py-16 text-center">
        <Reveal>
          <UserIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">Your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view your profile, orders, and saved items.
          </p>
          <Link
            href="/login?next=/account"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            New here?{" "}
            <Link
              href="/login?mode=signup&next=/account"
              className="underline"
            >
              Create an account
            </Link>
          </p>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{profile.email}</span>
          {profile.display_name && (
            <>
              {" "}· <span className="font-medium">{profile.display_name}</span>
            </>
          )}
        </p>
      </Reveal>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Reveal delay={0.05}>
          <Link
            href="/account/orders"
            className="group block rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
          >
            <Package className="h-5 w-5" />
            <div className="mt-2 text-sm font-medium">Orders</div>
            <div className="text-xs text-muted-foreground">View past orders</div>
          </Link>
        </Reveal>

        {profile.is_admin && (
          <Reveal delay={0.1}>
            <Link
              href="/admin/inventory"
              className="group block rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
            >
              <ShieldCheck className="h-5 w-5" />
              <div className="mt-2 text-sm font-medium">Admin</div>
              <div className="text-xs text-muted-foreground">
                Manage inventory
              </div>
            </Link>
          </Reveal>
        )}

        <Reveal delay={0.15} className="sm:col-span-2">
          <SignOutButton />
        </Reveal>
      </div>
    </main>
  );
}
