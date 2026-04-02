import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check for referral cookie (set by /rejoindre page)
        const cookieStore = await cookies();
        const referralHandle = cookieStore.get("ml-referral")?.value;

        if (referralHandle) {
          // Look up the sponsor's profile
          const { data: sponsor } = await supabase
            .from("profiles")
            .select("id")
            .eq("x_handle", referralHandle)
            .eq("status", "approved")
            .single();

          if (sponsor) {
            // Link the new user to the sponsor + create a sponsorship request
            await supabase
              .from("profiles")
              .update({ sponsored_by: sponsor.id })
              .eq("id", user.id);

            // Create sponsorship request so sponsor can approve
            await supabase.from("sponsorship_requests").insert({
              requester_id: user.id,
              sponsor_handle: referralHandle,
              sponsor_id: sponsor.id,
              status: "pending",
              attempt_number: 1,
            });
          }

          // Clear the cookie
          cookieStore.set("ml-referral", "", { path: "/", maxAge: 0 });
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("status, onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.status === "approved") {
          if (!profile.onboarding_completed) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
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
