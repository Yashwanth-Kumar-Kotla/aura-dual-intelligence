/**
 * NextAuth Configuration
 * 
 * NextAuth.js is the standard authentication library for Next.js.
 * This file sets up authentication using the "Credentials" provider,
 * which means users log in with email/password (not OAuth like Google/GitHub).
 * 
 * Why NextAuth?
 * - Handles sessions automatically (cookies, JWT tokens)
 * - Provides secure authentication out of the box
 * - Easy to extend with OAuth providers later if needed
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "../../../../lib/users";

// NextAuth v5 configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Pages customization - we'll create custom login/signup pages
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  
  // Providers define HOW users can authenticate
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      // This function runs when a user tries to log in
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }
        
        // Find user by email
        const user = getUserByEmail(credentials.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }
        
        // Handle OTP users (no password) - allow login if password is empty
        if (!user.password && credentials.password === "") {
          // OTP user - allow login
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
        
        // Handle password users - verify password
        if (!credentials.password) {
          throw new Error("Password is required");
        }
        
        if (!user.password) {
          throw new Error("This account uses OTP login. Please use the OTP option.");
        }
        
        // Verify password (compare plain text with hashed password)
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }
        
        // Return user data (without password!) to be stored in session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  
  // Callbacks modify the session and JWT token
  callbacks: {
    // This runs when a JWT token is created or updated
    async jwt({ token, user }) {
      // On first login, user object is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    // This runs whenever a session is checked
    // The session is what you access in your components with useSession()
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  
  // Security settings
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  session: {
    strategy: "jwt",
  },
});

// Export the handlers for GET and POST requests (NextAuth v5 syntax)
export const { GET, POST } = handlers;

