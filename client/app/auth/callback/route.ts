// @ts-nocheck
// Auth callback route for Google OAuth authentication
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_DOMAIN = "christuniversity.in";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sociotest-thesocioofficial.vercel.app";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  console.log("Auth callback called with:", { code: !!code, error, url: requestUrl.toString() });

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${APP_URL}/?error=oauth_error&details=${error}`);
  }

  if (!code) {
    console.warn("Auth callback invoked without a 'code' parameter.");
    return NextResponse.redirect(`${APP_URL}/?error=no_code`);
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: cookieStore });

  try {
    console.log("Exchanging code for session...");
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (exchangeError) {
      console.error(
        "Error exchanging code for session:",
        exchangeError.message
      );
      return NextResponse.redirect(`${APP_URL}/?error=auth_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`);
    }

    console.log("Getting session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      console.error(
        "Error getting session after exchange:",
        sessionError.message
      );
      return NextResponse.redirect(`${APP_URL}/?error=session_fetch_failed&details=${encodeURIComponent(sessionError.message)}`);
    }

    if (!session || !session.user || !session.user.email) {
      console.warn(
        "No session or user email found after successful code exchange."
      );
      await supabase.auth.signOut();
      return NextResponse.redirect(`${APP_URL}/?error=auth_incomplete`);
    }

    console.log("Session created for user:", session.user.email);

    if (!session.user.email.endsWith(ALLOWED_DOMAIN)) {
      console.warn("User email not from allowed domain:", session.user.email);
      await supabase.auth.signOut();
      return NextResponse.redirect(`${APP_URL}/error?error=invalid_domain`);
    }

    // Create response with redirect
    const response = NextResponse.redirect(`${APP_URL}/discover`);
    
    // Set additional headers to ensure session is properly maintained
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log("Redirecting to discover page...");
    return response;
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    const supabaseClient = createRouteHandlerClient({
      cookies: cookies(),
    });
    await supabaseClient.auth.signOut();
    return NextResponse.redirect(`${APP_URL}/?error=callback_exception&details=${encodeURIComponent(String(error))}`);
  }
}
