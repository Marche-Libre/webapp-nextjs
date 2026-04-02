import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check profile status to redirect appropriately
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .single();

        if (profile?.status === "approved") {
          return NextResponse.redirect(`${origin}/forum`);
        }
        // pending or just created
        return NextResponse.redirect(`${origin}/en-attente`);
      }
    }
  }

  // Something went wrong — redirect to login
  return NextResponse.redirect(`${origin}/connexion`);
}
