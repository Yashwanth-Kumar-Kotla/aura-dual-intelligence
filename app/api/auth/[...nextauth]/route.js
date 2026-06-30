import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "../../../../lib/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // OTP user (no password) — allow login with empty password field
        if (!user.password_hash && credentials.password === "") {
          return { id: user.id, email: user.email, name: user.name };
        }

        if (!credentials.password) {
          throw new Error("Password is required");
        }

        if (!user.password_hash) {
          throw new Error("This account uses OTP login. Please use the OTP option.");
        }

        const isValid = await verifyPassword(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  session: { strategy: "jwt" },
});

export const { GET, POST } = handlers;
