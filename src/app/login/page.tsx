import Link from "next/link";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — cluxe",
  description: "Sign in to your cluxe account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const { next = "/account", mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <div className="mt-8 rounded-lg border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          <h1 className="text-xl font-semibold">
            {isSignup ? "Create your account" : "Sign in"}
          </h1>
        </div>

        <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Sign-in coming soon</span>
          </div>
          <p>
            We&apos;re wiring up the auth flow next. Until then, the magic-admin
            email you added to <code className="rounded bg-background px-1">admin_emails</code> will be
            auto-promoted on first login.
          </p>
          <p className="mt-3 text-xs">
            After running <code className="rounded bg-background px-1">supabase/schema_v2.sql</code>,
            you&apos;ll be able to sign in with your admin email and access{" "}
            <Link href="/admin/inventory" className="underline">
              /admin/inventory
            </Link>
            .
          </p>
        </div>

        <Link
          href={next}
          className="mt-6 block w-full rounded-md border bg-background py-2 text-center text-sm font-medium transition-colors hover:bg-accent"
        >
          Continue as guest
        </Link>
      </div>
    </main>
  );
}
