"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, AlertCircle, Sparkles, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase/auth-actions";

type Result = { ok: true; redirectTo: string } | { ok: false; error: string };

const ADMIN_EMAIL = "kingneliusmuso@gmail.com";

type AuthFormProps = {
  mode: "signin" | "signup";
  next: string;
};

function SubmitButton({ label, pendingLabel, icon: Icon }: { label: string; pendingLabel: string; icon: React.ElementType }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      <Icon className="h-4 w-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [email, setEmail] = React.useState("");
  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

  const action = isSignup ? signUpWithPassword : signInWithPassword;
  const [state, formAction] = useFormState<Result | null, FormData>(action, null);

  // Handle successful submit (form action returns { ok: true, redirectTo })
  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {isAdmin && (
        <div
          className={cn(
            "rounded-md border bg-foreground p-3 text-xs",
            "text-background"
          )}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Admin email detected
          </div>
          <p className="mt-1 opacity-80">
            You&apos;ll be auto-verified and granted admin access. No email link required.
          </p>
        </div>
      )}

      {isSignup && (
        <div>
          <label htmlFor="displayName" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Your name"
            className="mt-1.5"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="At least 8 characters"
          className="mt-1.5"
        />
        {isSignup && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters, numbers, and symbols.
          </p>
        )}
      </div>

      {state && "ok" in state && !state.ok && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton
        icon={isSignup ? UserPlus : LogIn}
        label={isSignup ? "Create account" : "Sign in"}
        pendingLabel={isSignup ? "Creating account..." : "Signing in..."}
      />

      <p className="text-center text-xs text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href={`/login?mode=signup${next ? `&next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-foreground underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function SuccessCheck({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
      <Check className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
