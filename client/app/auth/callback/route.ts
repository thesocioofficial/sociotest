// @ts-nocheck
// Auth callback route for Google OAuth authentication
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sociotest-thesocioofficial.vercel.app";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  console.log("Auth callback called with code:", !!code, "error:", error);

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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError.message);
      return NextResponse.redirect(`${APP_URL}/?error=auth_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`);
    }

    console.log("Code exchange successful, redirecting to discover...");
    
    // Simple redirect - let the client-side handle session validation
    const response = NextResponse.redirect(`${APP_URL}/discover`);
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    return response;
    
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(`${APP_URL}/?error=callback_exception&details=${encodeURIComponent(String(error))}`);
  }
}
