import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/supabase/auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: profile.id, email: profile.email, displayName: profile.display_name },
    isAdmin: profile.is_admin === true,
  });
}
