"use client";

/**
 * Login Page
 * 
 * Supports both password and OTP (email) login methods.
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/chat");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSendingOTP(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setSendingOTP(false);
        return;
      }

      setOtpSent(true);
      setSendingOTP(false);
      setCountdown(60); // 1 minute countdown for resend // 60 second countdown

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      setSendingOTP(false);
    }
  };

  // Verify OTP and login
  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify OTP");
        setLoading(false);
        return;
      }

      // OTP verified - create session
      const result = await signIn("credentials", {
        email,
        password: "", // Empty for OTP users
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to create session. Please try again.");
        setLoading(false);
      } else {
        router.push("/chat");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg animate-pulse" />
              <span className="font-semibold tracking-tight text-lg text-gray-900">
                Aura Duo
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">
              Welcome Back
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Sign in to your account
            </h1>
            <p className="text-sm text-gray-600">
              Access your collaborative AI chat
            </p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setOtpSent(false);
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-medium transition ${
                loginMethod === "password"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp");
                setOtpSent(false);
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-medium transition ${
                loginMethod === "otp"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Password Login Form */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {loginMethod === "otp" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp-email" className="block text-xs font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="otp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP || !email}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  {sendingOTP ? "Sending..." : "Send OTP Code"}
                </button>
              ) : (
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div>
                    <label htmlFor="otp-code" className="block text-xs font-medium text-gray-700 mb-2">
                      Enter 6-digit code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Check your email for the verification code
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        setError("");
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 transition"
                    >
                      Use different email
                    </button>
                    {countdown > 0 ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Resend code in {countdown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={sendingOTP}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition mt-2"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Sign up link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-700 transition"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
