"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Hero from "./_components/Home/Hero";
import Features from "./_components/Home/Features";
import UpcomingEvents from "./_components/Home/UpcomingEvents";
import CTA from "./_components/Home/CTA";
import FAQPage from "./_components/Home/FAQs";
import Footer from "./_components/Home/Footer";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for authentication errors in URL params
    const error = searchParams?.get('error');
    const details = searchParams?.get('details');
    
    if (error) {
      let message = "Authentication failed. Please try again.";
      
      switch (error) {
        case 'no_code':
          message = "Authentication was cancelled or failed to complete.";
          break;
        case 'auth_exchange_failed':
          message = "Failed to authenticate with Google. Please try again.";
          break;
        case 'session_fetch_failed':
          message = "Failed to create session. Please try again.";
          break;
        case 'auth_incomplete':
          message = "Authentication incomplete. Please try again.";
          break;
        case 'callback_exception':
          message = "An unexpected error occurred during authentication.";
          break;
        case 'oauth_error':
          message = "OAuth authentication error occurred.";
          break;
      }
      
      if (details) {
        message += ` (${decodeURIComponent(details)})`;
      }
      
      setErrorMessage(message);
      
      // Clear error from URL after showing it
      setTimeout(() => {
        setErrorMessage(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        url.searchParams.delete('details');
        window.history.replaceState({}, '', url.toString());
      }, 8000);
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray<HTMLElement>(".section").forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }, [searchParams]);

  return (
    <>
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        </div>
      )}
      
      <div className="section">
        <Hero />
      </div>
      <div className="section">
        <Features />
      </div>
      <div className="section">
        <UpcomingEvents />
      </div>
      <div className="section">
        <CTA />
      </div>
      <div className="section">
        <FAQPage />
      </div>
      <div className="section">
        <Footer />
      </div>
    </>
  );
}
