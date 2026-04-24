import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = [
    "/",
    "/connexion",
    "/inscription",
    "/en-attente",
    "/rejoindre",
  ];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/auth/");

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // If authenticated, check profile status and redirect accordingly
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, onboarding_completed")
      .eq("id", user.id)
      .single();

    const isApproved = profile?.status === "approved";
    const isOnboarded = profile?.onboarding_completed === true;
    const isPending = !isApproved;

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
      (pathname === "/" ||
        pathname === "/connexion" ||
        pathname === "/inscription" ||
        pathname === "/en-attente")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/forum";
      return NextResponse.redirect(url);
    }
  }

  // Security headers
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  supabaseResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");

  return supabaseResponse;
}
