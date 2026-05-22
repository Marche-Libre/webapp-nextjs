import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";

function getAuthErrorRedirect(origin: string) {
  const redirectUrl = new URL("/connexion", origin);
  redirectUrl.searchParams.set("auth", "access");
  redirectUrl.searchParams.set("error", "oauth_callback");
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    console.error("[auth/callback] Missing OAuth code");
    return NextResponse.redirect(getAuthErrorRedirect(origin));
  }

  // We need a response object to write cookies to.
  // Start with the MVP app destination; profile checks can narrow it below.
  let redirectPath = "/chat";
  const cookiesToWrite: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed", {
      message: error.message,
      name: error.name,
      status: error.status,
    });
    return NextResponse.redirect(getAuthErrorRedirect(origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[auth/callback] No user after OAuth code exchange");
    return NextResponse.redirect(getAuthErrorRedirect(origin));
  }

  // Check profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.status === "approved") {
    // Clear stale referral
    cookiesToWrite.push({
      name: "ml-referral",
      value: "",
      options: { path: "/", maxAge: 0 },
    });
    redirectPath = "/chat";
  } else {
    // New/pending user — handle referral
    const referralHandle = request.cookies.get("ml-referral")?.value;

    if (referralHandle && profile?.status === "pending") {
      const sponsorshipResult = await createSponsorshipRequestForHandle(
        supabase,
        {
          requesterId: user.id,
          sponsorHandle: referralHandle,
        },
      );

      if (!sponsorshipResult.ok) {
        console.warn("[auth/callback] referral sponsorship request failed", {
          reason: sponsorshipResult.status,
          message: sponsorshipResult.technicalMessage ?? sponsorshipResult.message,
        });
      }

      cookiesToWrite.push({
        name: "ml-referral",
        value: "",
        options: { path: "/", maxAge: 0 },
      });
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
