import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectToAccessModal(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("auth", "access");
  return NextResponse.redirect(url);
}

function redirectToPath(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
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
  const isAccessModalEntry =
    pathname === "/" && request.nextUrl.searchParams.get("auth") === "access";
  const isPlainLandingRoute = pathname === "/" && !isAccessModalEntry;

  const legalRoutes = ["/mentions-legales", "/confidentialite", "/cgu"];
  const authEntryRoutes = ["/", "/connexion", "/inscription", "/rejoindre"];
  const acquisitionRoutes = [
    "/acces-prive",
    "/landing1",
    "/landing2",
    "/landing3",
  ];
  const publicNonPrivateRouteHandlers = ["/api/geo/cities"];

  // Public routes that don't require auth
  const publicRoutes = [
    ...authEntryRoutes,
    ...acquisitionRoutes,
    "/en-attente",
    ...legalRoutes,
  ];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/auth/");
  const isLegalRoute = legalRoutes.includes(pathname);
  const isAcquisitionRoute = acquisitionRoutes.includes(pathname);
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
  if (
    user &&
    !isLegalRoute &&
    !isAcquisitionRoute &&
    !isPublicNonPrivateRouteHandler
  ) {
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
    const hasKnownStatus = isApproved || isRejected || isPending;

    if (
      !hasKnownStatus &&
      !isPlainLandingRoute &&
      pathname !== "/en-attente"
    ) {
      return redirectToPath(request, "/en-attente");
    }

    // Rejected users stay on the status boundary so the app can show a clear refusal state.
    if (
      isRejected &&
      !isPlainLandingRoute &&
      pathname !== "/en-attente" &&
      pathname !== "/connexion"
    ) {
      return redirectToPath(request, "/en-attente");
    }

    // Pending users can only see /en-attente
    if (isPending && !isPlainLandingRoute && pathname !== "/en-attente") {
      return redirectToPath(request, "/en-attente");
    }

    // Approved members can access the app even when onboarding is incomplete.
    // Keep the marketing landing page and /onboarding manually accessible.
    // Keep the marketing landing page visible even when a member is signed in.
    if (
      isApproved &&
      ((authEntryRoutes.includes(pathname) && !isPlainLandingRoute) ||
        pathname === "/en-attente")
    ) {
      return redirectToPath(request, "/chat");
    }
  }

  return withSecurityHeaders(supabaseResponse);
}
