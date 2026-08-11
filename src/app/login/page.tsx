import Link from "next/link";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — cluxe",
  description: "Sign in to your cluxe account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const { next = "/account", mode = "signin", error } = await searchParams;
  const isSignup = mode === "signup";

  // If already signed in, send them on
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(profile.is_admin ? "/admin/inventory" : next);
  }

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
          {isSignup ? (
            <UserPlus className="h-5 w-5" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          <h1 className="text-xl font-semibold">
            {isSignup ? "Create your account" : "Sign in"}
          </h1>
        </div>

        <AuthForm mode={isSignup ? "signup" : "signin"} next={next} />

        {error === "verification_failed" && (
          <p className="mt-4 text-center text-xs text-destructive">
            Verification link expired or invalid. Try signing up again.
          </p>
        )}
      </div>
    </main>
  );
}
