"use client";

/**
 * Header Component
 * 
 * This header shows different content based on whether the user is logged in:
 * - If logged in: Shows profile dropdown with menu options
 * - If not logged in: Shows login/signup buttons
 * 
 * Why client component? We use useSession() hook which only works in client components.
 */

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg animate-pulse" />
          <span className="font-semibold tracking-tight text-sm text-gray-900">
            Aura Duo
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition font-medium">
            Home
          </Link>
          {session && (
            <Link href="/chat" className="hover:text-gray-900 transition font-medium">
              Chat
            </Link>
          )}
          <Link href="/#how-it-works" className="hover:text-gray-900 transition font-medium">
            How it works
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="text-xs text-gray-400">Loading...</div>
          ) : session ? (
            <>
              <Link
                href="/chat"
                className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Launch Duo
              </Link>
              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

