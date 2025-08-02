"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          setStatus("Authentication failed");
          setTimeout(() => {
            router.push(`/?error=oauth_error&details=${error}`);
          }, 2000);
          return;
        }

        if (!code) {
          console.warn("No authentication code found");
          setStatus("Authentication failed - no code");
          setTimeout(() => {
            router.push("/?error=no_code");
          }, 2000);
          return;
        }

        setStatus("Exchanging code for session...");
        
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error("Error exchanging code:", exchangeError);
          setStatus("Failed to create session");
          setTimeout(() => {
            router.push(`/?error=auth_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`);
          }, 2000);
          return;
        }

        setStatus("Verifying session...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setStatus("Session verification failed");
          setTimeout(() => {
            router.push(`/?error=session_fetch_failed&details=${encodeURIComponent(sessionError.message)}`);
          }, 2000);
          return;
        }

        if (!session || !session.user?.email) {
          console.warn("No session or email found");
          setStatus("Authentication incomplete");
          setTimeout(() => {
            router.push("/?error=auth_incomplete");
          }, 2000);
          return;
        }

        if (!session.user.email.endsWith("christuniversity.in")) {
          console.warn("Invalid domain:", session.user.email);
          await supabase.auth.signOut();
          setStatus("Invalid email domain");
          setTimeout(() => {
            router.push("/error?error=invalid_domain");
          }, 2000);
          return;
        }

        setStatus("Authentication successful! Redirecting...");
        console.log("Auth successful for:", session.user.email);
        
        // Give a moment for the session to be fully established
        setTimeout(() => {
          router.push("/discover");
        }, 1000);

      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        setStatus("An unexpected error occurred");
        setTimeout(() => {
          router.push(`/?error=callback_exception&details=${encodeURIComponent(String(error))}`);
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#154CB3] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
