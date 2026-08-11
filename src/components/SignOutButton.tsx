"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/supabase/auth-actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg border bg-card p-5 text-left transition-colors hover:bg-accent"
      >
        <LogOut className="h-5 w-5" />
        <div>
          <div className="text-sm font-medium">Sign out</div>
          <div className="text-xs text-muted-foreground">
            End your session on this device
          </div>
        </div>
      </button>
    </form>
  );
}
