// src/lib/supabase/auth.ts
// Server-side helpers for the current session + admin gating.

import { createClient } from "./server";
import type { Profile } from "@/types/database";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, email, is_admin, created_at")
      .eq("id", user.id)
      .maybeSingle();

    return (data ?? null) as Profile | null;
  } catch {
    return null;
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.is_admin === true;
}
