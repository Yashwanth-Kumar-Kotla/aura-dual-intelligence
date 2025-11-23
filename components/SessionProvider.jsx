"use client";

/**
 * Session Provider Wrapper
 * 
 * NextAuth requires a SessionProvider to wrap your app
 * so that components can access session data using useSession().
 * 
 * Why client component? NextAuth's SessionProvider uses React Context,
 * which only works in client components.
 */

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

