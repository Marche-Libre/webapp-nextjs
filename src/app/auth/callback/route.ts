import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";
import {
  captureAuthException,
  captureAuthMessage,
  setObservedUser,
} from "@/lib/observability/auth";

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
    captureAuthMessage("OAuth callback missing code", {
      source: "oauth_callback",
      step: "missing_code",
    }, "warning");
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
    captureAuthException(error, {
      source: "oauth_callback",
      step: "exchange_failed",
    });
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
    captureAuthMessage("OAuth callback did not create a user session", {
      source: "oauth_callback",
      step: "missing_user",
    }, "error");
    console.error("[auth/callback] No user after OAuth code exchange");
    return NextResponse.redirect(getAuthErrorRedirect(origin));
  }

  setObservedUser(user.id);

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
        captureAuthMessage("Referral sponsorship request failed during callback", {
          source: "oauth_callback",
          step: "referral_request_failed",
          hasReferral: true,
          status: profile?.status,
        }, "warning");
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
  captureAuthMessage("OAuth callback completed", {
    source: "oauth_callback",
    step: "completed",
    status: profile?.status,
    destination: redirectPath,
  });
  const response = NextResponse.redirect(new URL(redirectPath, origin));
  cookiesToWrite.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
