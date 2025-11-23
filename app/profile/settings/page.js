"use client";

/**
 * Profile Settings Page
 * 
 * Allows users to update their profile information and preferences.
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "../../../components/ProtectedRoute";

function SettingsContent() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load API key status
  useEffect(() => {
    async function loadApiKeys() {
      try {
        const res = await fetch("/api/user/api-keys");
        if (res.ok) {
          const data = await res.json();
          setHasOpenaiKey(data.hasOpenaiKey);
          setHasGeminiKey(data.hasGeminiKey);
        }
      } catch (error) {
        console.error("Error loading API keys:", error);
      } finally {
        setLoadingKeys(false);
      }
    }

    if (session) {
      loadApiKeys();
    }
  }, [session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // In a real app, you'd have an API endpoint to update user profile
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-blue-600 mb-1 font-semibold">
          Settings
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Account Settings
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-xl mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-6">
        <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>

        {message.text && (
          <div
            className={`rounded-2xl px-4 py-3 text-xs ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full rounded-2xl bg-gray-100 border border-gray-200 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-medium px-5 py-2.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Account Actions */}
      <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Account Actions</h3>
        <div className="space-y-3">
          <button className="w-full text-left rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-700 hover:bg-gray-100 transition">
            Change Password
          </button>
          <button className="w-full text-left rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 hover:bg-red-100 transition">
            Delete Account
          </button>
        </div>
      </div>

      {/* API Keys Info */}
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">API Configuration</h3>
        <p className="text-xs text-gray-600 mb-3">
          Aura Duo uses your own API keys for GPT-4o and Gemini. Set them in your environment variables.
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <code className="bg-white px-2 py-1 rounded text-blue-600">OPENAI_API_KEY</code>
            <span className="text-gray-600">for GPT-4o mini</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-white px-2 py-1 rounded text-purple-600">GEMINI_API_KEY</code>
            <span className="text-gray-600">for Gemini 1.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

