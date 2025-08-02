import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/auth/callback", "/error", "/about", "/auth"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { pathname } = req.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return res;
  }

  // Always allow public paths without authentication check
  const isPublic = (currentPath: string) =>
    publicPaths.some(
      (publicPath) =>
        currentPath === publicPath ||
        (publicPath.endsWith("/*") &&
          currentPath.startsWith(publicPath.slice(0, -2)))
    );

  if (isPublic(pathname)) {
    return res;
  }

  // Only check authentication for non-public paths
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session and trying to access protected route, redirect to auth
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }

    // For organizer-only routes, check permissions
    if (
      session &&
      (pathname.startsWith("/manage") ||
        pathname.startsWith("/create") ||
        pathname.startsWith("/edit"))
    ) {
      if (!session.user?.email) {
        const errorRedirectUrl = req.nextUrl.clone();
        errorRedirectUrl.pathname = "/error";
        return NextResponse.redirect(errorRedirectUrl);
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("is_organiser")
        .eq("email", session.user.email)
        .single();

      if (error || !userData || !userData.is_organiser) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/error";
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed to avoid breaking the flow
    return res;
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
