"use server";

import { redirect } from "next/navigation";
import { createClient } from "./server";
import { isCurrentUserAdmin } from "./auth";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteUrl = rawSiteUrl.replace(/\/$/, "").replace(/\/.*$/, "");

type AuthResult = { ok: true; redirectTo: string } | { ok: false; error: string };

export async function signInWithPassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return {
          ok: false,
          error: "Please verify your email first — check your inbox.",
        };
      }
      if (
        error.message.toLowerCase().includes("invalid login") ||
        error.message.toLowerCase().includes("invalid credentials") ||
        error.message.toLowerCase().includes("invalid grant")
      ) {
        return { ok: false, error: "Wrong email or password." };
      }
      console.error("signInWithPassword failed:", error);
      return { ok: false, error: "We couldn't sign you in. Please try again." };
    }
  } catch (e) {
    console.error("signInWithPassword unavailable:", e);
    return { ok: false, error: "Sign-in service unavailable." };
  }

  // If they are the admin, send them to inventory
  const isAdmin = await isCurrentUserAdmin();
  return { ok: true, redirectTo: isAdmin && next === "/account" ? "/admin/inventory" : next };
}

export async function signUpWithPassword(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (displayName.length < 2) {
    return { ok: false, error: "Display name must be at least 2 characters." };
  }

  const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: { display_name: displayName },
      },
    });

    if (error) {
      console.error("signUpWithPassword failed:", error);
      console.error("signUpWithPassword callbackUrl was:", callbackUrl);
      return {
        ok: false,
        error: "We couldn't create your account. Please try again.",
      };
    }

    // Supabase returns a user with identities=[] when the email is already
    // registered (to avoid leaking which emails exist). Treat that as
    // "already registered".
    if (
      data?.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      return {
        ok: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }

    // If signup completed without a session, the user still needs to verify
    // email. (For the admin, the trigger silently confirms the email, so
    // signInWithPassword will succeed right after — see below.)
    if (!data.session) {
      return {
        ok: false,
        error:
          "Check your inbox — we sent a confirmation link. (Admin accounts are auto-verified.)",
      };
    }
  } catch (e) {
    console.error("signUpWithPassword unavailable:", e);
    return { ok: false, error: "Sign-up service unavailable." };
  }

  const isAdmin = await isCurrentUserAdmin();
  return {
    ok: true,
    redirectTo: isAdmin && next === "/account" ? "/admin/inventory" : next,
  };
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("signOut failed:", e);
  }
  redirect("/");
}
