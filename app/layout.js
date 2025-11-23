import "./globals.css";
import AuthSessionProvider from "../components/SessionProvider";
import Header from "../components/Header";

export const metadata = {
  title: "Aura Duo — Collaborative AI",
  description: "GPT-4o + Gemini collaborating on your questions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Floating animated orbs */}
        <div className="floating-orb orb-blue" />
        <div className="floating-orb orb-purple" />
        <div className="floating-orb orb-pink" />
        
        {/* SessionProvider wraps the app so all components can access session */}
        <AuthSessionProvider>
          <Header />
          <main className="pt-20">{children}</main>
        </AuthSessionProvider>

        <footer className="border-t border-gray-200 mt-16 py-6 text-center text-[11px] text-gray-500">
          © {new Date().getFullYear()} Aura Duo. GPT-4o + Gemini collaborating.
        </footer>
      </body>
    </html>
  );
}
