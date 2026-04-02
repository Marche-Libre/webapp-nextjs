import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/connexion", "/inscription", "/en-attente", "/rejoindre"];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/auth/");

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages
  if (user && (pathname === "/connexion" || pathname === "/inscription")) {
    const url = request.nextUrl.clone();
    url.pathname = "/forum";
    return NextResponse.redirect(url);
  }

  // If authenticated and not on /onboarding or public routes, check onboarding status
  if (user && !isPublicRoute && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (
      profile &&
      profile.status === "approved" &&
      profile.onboarding_completed !== true
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
