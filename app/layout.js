import "./globals.css";

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
        
        <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg animate-pulse" />
              <span className="font-semibold tracking-tight text-sm text-gray-900">
                Aura Duo
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-xs text-gray-600">
              <a href="/" className="hover:text-gray-900 transition font-medium">Home</a>
              <a href="/chat" className="hover:text-gray-900 transition font-medium">Chat</a>
              <a href="/#how-it-works" className="hover:text-gray-900 transition font-medium">
                How it works
              </a>
            </div>

            <a
              href="/chat"
              className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              Launch Duo
            </a>
          </nav>
        </header>

        <main className="pt-20">{children}</main>

        <footer className="border-t border-gray-200 mt-16 py-6 text-center text-[11px] text-gray-500">
          © {new Date().getFullYear()} Aura Duo. GPT-4o + Gemini collaborating.
        </footer>
      </body>
    </html>
  );
}
