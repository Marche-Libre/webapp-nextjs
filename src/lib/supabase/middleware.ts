import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectToAccessModal(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("auth", "access");
  return NextResponse.redirect(url);
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  const legalRoutes = ["/mentions-legales", "/confidentialite", "/cgu"];
  const authEntryRoutes = ["/", "/connexion", "/inscription", "/rejoindre"];
  const publicNonPrivateRouteHandlers = ["/api/geo/cities"];

  // Public routes that don't require auth
  const publicRoutes = [
    ...authEntryRoutes,
    "/en-attente",
    ...legalRoutes,
  ];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/auth/");
  const isLegalRoute = legalRoutes.includes(pathname);
  const isPublicNonPrivateRouteHandler = publicNonPrivateRouteHandlers.includes(
    pathname,
  );

  if (pathname.startsWith("/auth/")) {
    return withSecurityHeaders(supabaseResponse);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isPublicRoute || isPublicNonPrivateRouteHandler) {
      return withSecurityHeaders(supabaseResponse);
    }

    return redirectToAccessModal(request);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    if (isPublicRoute || isPublicNonPrivateRouteHandler) {
      return withSecurityHeaders(supabaseResponse);
    }

    return redirectToAccessModal(request);
  }

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isPublicNonPrivateRouteHandler) {
    return redirectToAccessModal(request);
  }

  // If authenticated, check profile status and redirect accordingly
  if (user && !isLegalRoute && !isPublicNonPrivateRouteHandler) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      if (!authEntryRoutes.includes(pathname)) {
        return redirectToAccessModal(request);
      }
      return supabaseResponse;
    }

    const isApproved = profile?.status === "approved";
    const isRejected = profile?.status === "rejected";
    const isPending = profile?.status === "pending";
    const isOnboarded = profile?.onboarding_completed === true;
    const hasKnownStatus = isApproved || isRejected || isPending;

    if (!hasKnownStatus && pathname !== "/en-attente") {
      const url = request.nextUrl.clone();
      url.pathname = "/en-attente";
      return NextResponse.redirect(url);
    }

    // Rejected users stay on the status boundary so the app can show a clear refusal state.
    if (isRejected && pathname !== "/en-attente" && pathname !== "/connexion") {
      const url = request.nextUrl.clone();
      url.pathname = "/en-attente";
      return NextResponse.redirect(url);
    }

    // Pending users can only see /en-attente
    if (isPending && pathname !== "/en-attente") {
      const url = request.nextUrl.clone();
      url.pathname = "/en-attente";
      return NextResponse.redirect(url);
    }

    // Approved but not onboarded → force onboarding
    if (isApproved && !isOnboarded && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Fully onboarded users on landing/auth pages → redirect to app
    if (
      isApproved &&
      isOnboarded &&
      (authEntryRoutes.includes(pathname) ||
        pathname === "/en-attente" ||
        pathname === "/onboarding")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/chat";
      return NextResponse.redirect(url);
    }
  }

  return withSecurityHeaders(supabaseResponse);
}
