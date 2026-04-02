import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_PENDING_REFERRALS = 5;
const MAX_TOTAL_FILLEULS = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/connexion", origin));
  }

  // We need a response object to write cookies to.
  // Start with a redirect to /forum (we'll change the destination later if needed).
  let redirectPath = "/forum";
  const cookiesToWrite: { name: string; value: string; options?: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Collect cookies — we'll write them to the final response
          cookiesToSet.forEach((c) => cookiesToWrite.push(c));
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/connexion", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/connexion", origin));
  }

  // Check profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.status === "approved") {
    // Clear stale referral
    cookiesToWrite.push({ name: "ml-referral", value: "", options: { path: "/", maxAge: 0 } });
    redirectPath = profile.onboarding_completed ? "/forum" : "/onboarding";
  } else {
    // New/pending user — handle referral
    const referralHandle = request.cookies.get("ml-referral")?.value;

    if (referralHandle) {
      const { data: sponsor } = await supabase
        .from("profiles")
        .select("id, is_admin, accept_referrals")
        .eq("x_handle", referralHandle)
        .eq("status", "approved")
        .single();

      if (sponsor && sponsor.accept_referrals !== false) {
        let canSponsor = true;

        if (!sponsor.is_admin) {
          const { count: pendingCount } = await supabase
            .from("sponsorship_requests")
            .select("*", { count: "exact", head: true })
            .eq("sponsor_id", sponsor.id)
            .eq("status", "pending");

          const { count: totalFilleuls } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("sponsored_by", sponsor.id)
            .eq("status", "approved");

          if ((pendingCount ?? 0) >= MAX_PENDING_REFERRALS || (totalFilleuls ?? 0) >= MAX_TOTAL_FILLEULS) {
            canSponsor = false;
          }
        }

        if (canSponsor) {
          await supabase
            .from("profiles")
            .update({ sponsored_by: sponsor.id })
            .eq("id", user.id);

          await supabase.from("sponsorship_requests").insert({
            requester_id: user.id,
            sponsor_handle: referralHandle,
            sponsor_id: sponsor.id,
            status: "pending",
            attempt_number: 1,
          });
        }
      }

      cookiesToWrite.push({ name: "ml-referral", value: "", options: { path: "/", maxAge: 0 } });
    }

    redirectPath = "/en-attente";
  }

  // Build the final response with ALL cookies
  const response = NextResponse.redirect(new URL(redirectPath, origin));
  cookiesToWrite.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
