"use client";

/**
 * Protected Route Component
 * 
 * This component wraps pages that require authentication.
 * If user is not logged in, it redirects them to the login page.
 * 
 * Why this approach? It's simple and works well with Next.js App Router.
 * Alternative: Use middleware.ts for route-level protection (more advanced).
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If session is still loading, wait
    if (status === "loading") return;

    // If no session, redirect to login
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg animate-pulse" />
            <span className="font-semibold tracking-tight text-lg text-gray-900">
              Aura Duo
            </span>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no session, don't render children (redirect will happen)
  if (!session) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

