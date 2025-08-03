"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/logo.svg";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function NavigationBar() {
  const { session, userData, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <>
        <nav className="w-full flex justify-between items-center pt-8 pb-7 px-12 text-[#154CB3] select-none">
          <div className="h-10 w-24"></div>
          <div className="h-10 w-24"></div>
        </nav>
        <hr className="border-[#3030304b]" />
      </>
    );
  }

  return (
    <>
      <nav className="w-full flex justify-between items-center pt-8 pb-7 px-6 md:px-12 text-[#154CB3] select-none">
        <Link href={session ? "/discover" : "/"}>
          <Image
            src={Logo}
            alt="Logo"
            width={100}
            height={100}
            className="cursor-pointer"
          />
        </Link>

        {/* Navigation Links - Center */}
        {session && userData && (
          <div className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
              Discover
            </Link>
            <Link href="/events" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
              Events
            </Link>
            <Link href="/fests" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
              Fests
            </Link>
            <Link href="/clubs" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
              Clubs
            </Link>
            {userData.is_organiser && (
              <>
                <Link href="/create/event" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
                  Create Event
                </Link>
                <Link href="/create/fest" className="font-medium hover:text-[#154cb3df] transition-colors duration-200">
                  Create Fest
                </Link>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 items-center">
          {/* Mobile Menu Button */}
          {session && userData && (
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col gap-1 p-2 mr-2"
              aria-label="Toggle mobile menu"
            >
              <span className={`w-5 h-0.5 bg-[#154CB3] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[#154CB3] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-[#154CB3] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          )}
          {session && userData ? (
            userData.is_organiser ? (
              <div className="flex gap-4 items-center">
                <Link href="/manage">
                  <button className="cursor-pointer font-semibold px-4 py-2 border-2 rounded-full text-sm hover:bg-[#f3f3f3] transition-all duration-200 ease-in-out">
                    Manage events
                  </button>
                </Link>
                {userData.course && (
                  <Link href="/profile">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                        {userData?.avatar_url ? (
                          <Image
                            src={userData.avatar_url}
                            alt="Profile"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-sm">
                            {userData?.name
                              ? userData.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
                {!userData.course && (
                  <button
                    onClick={handleSignOut}
                    className="cursor-pointer font-semibold px-4 py-2 border-2 border-[#d6392b] hover:border-[#d6392b] hover:bg-[#d6392bdd] transition-all duration-200 ease-in-out text-sm rounded-full text-white bg-[#d6392b]"
                  >
                    Log out
                  </button>
                )}
              </div>
            ) : (
              <Link href="/profile">
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {userData?.name || "User"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                    {userData?.avatar_url ? (
                      <Image
                        src={userData.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-sm">
                        {userData?.name
                          ? userData.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="cursor-pointer font-semibold px-4 py-2 border-2 rounded-full text-sm hover:bg-[#f3f3f3] transition-all duration-200 ease-in-out"
              >
                Log in
              </button>
              <button
                onClick={handleSignIn}
                className="cursor-pointer font-semibold px-4 py-2 border-2 border-[#154CB3] hover:border-[#154cb3df] hover:bg-[#154cb3df] transition-all duration-200 ease-in-out text-sm rounded-full text-white bg-[#154CB3]"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>
      
      {/* Mobile Menu Dropdown */}
      {session && userData && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#3030304b] px-6 py-4">
          <div className="flex flex-col gap-4">
            <Link 
              href="/discover" 
              className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              href="/events" 
              className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/fests" 
              className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fests
            </Link>
            <Link 
              href="/clubs" 
              className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clubs
            </Link>
            {userData.is_organiser && (
              <>
                <Link 
                  href="/create/event" 
                  className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
                <Link 
                  href="/create/fest" 
                  className="font-medium text-[#154CB3] hover:text-[#154cb3df] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Fest
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      
      <hr className="border-[#3030304b]" />
    </>
  );
}
