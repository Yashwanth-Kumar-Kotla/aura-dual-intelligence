"use client";

/**
 * Signup Page
 * 
 * New flow: User enters Name, Email, Password, Confirm Password
 * → Sends OTP to verify email
 * → After OTP verification, account is created and user is logged in
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { validatePassword, getPasswordStrength } from "../../lib/passwordValidation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  
  const passwordStrength = getPasswordStrength(password);
  const passwordValidation = password ? validatePassword(password) : { isValid: false, errors: [] };
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Validate form before sending OTP
  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || "Password does not meet requirements");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Send OTP after form validation
  const handleSendOTP = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setError("");

    if (!validateForm()) {
      return;
    }

    setSendingOTP(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          purpose: "signup",
          // Include signup data for verification step
          signupData: {
            name: name.trim(),
            password: password, // Will be hashed on server
          }
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setSendingOTP(false);
        return;
      }

      setOtpSent(true);
      setSendingOTP(false);
      setCountdown(60); // 1 minute countdown for resend

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

  // Verify OTP and create account
  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          code: otpCode,
          purpose: "signup",
          // Include signup data to create account
          signupData: {
            name: name.trim(),
            password: password,
          }
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify OTP");
        setLoading(false);
        return;
      }

      // Account created - create session and redirect
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
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
              Get Started
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="text-sm text-gray-600">
              Join Aura Duo and start collaborating with AI
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Signup Form - Step 1: Enter Details */}
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
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
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPasswordRequirements(true);
                  }}
                  onFocus={() => setShowPasswordRequirements(true)}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
                  placeholder="Create a strong password"
                />
                
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.strength <= 2
                              ? "bg-red-500"
                              : passwordStrength.strength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                
                {showPasswordRequirements && (
                  <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs">
                    <p className="font-medium text-gray-700 mb-2">Password must contain:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-600" : ""}`}>
                        <span>{password.length >= 8 ? "✓" : "○"}</span>
                        <span>At least 8 characters</span>
                      </li>
                      <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                        <span>{/[A-Z]/.test(password) ? "✓" : "○"}</span>
                        <span>One uppercase letter (A-Z)</span>
                      </li>
                      <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? "text-green-600" : ""}`}>
                        <span>{/[a-z]/.test(password) ? "✓" : "○"}</span>
                        <span>One lowercase letter (a-z)</span>
                      </li>
                      <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                        <span>{/[0-9]/.test(password) ? "✓" : "○"}</span>
                        <span>One number (0-9)</span>
                      </li>
                      <li className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-600" : ""}`}>
                        <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "✓" : "○"}</span>
                        <span>One special character (!@#$%...)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-300 focus:border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="Confirm your password"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={sendingOTP || !passwordValidation.isValid || !passwordsMatch || !name.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                {sendingOTP ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Verify OTP */
            <form onSubmit={handleOTPVerification} className="space-y-4">
              <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm">
                <p className="text-blue-900 font-medium mb-1">Verification code sent!</p>
                <p className="text-blue-700 text-xs">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

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
                  autoFocus
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
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </span>
                ) : (
                  "Verify & Create Account"
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                    setError("");
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 transition"
                >
                  ← Back to edit details
                </button>
                {countdown > 0 ? (
                  <p className="text-xs text-gray-500">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSendOTP(e)}
                    disabled={sendingOTP}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Login link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Sign in
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
