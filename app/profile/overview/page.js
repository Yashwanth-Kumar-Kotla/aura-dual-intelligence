"use client";

/**
 * Profile Overview Page
 * 
 * Shows user account information and activity summary.
 */

import { useSession } from "next-auth/react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Link from "next/link";

function OverviewContent() {
  const { data: session } = useSession();

  const getInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return session?.user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-blue-600 mb-1 font-semibold">
          Profile
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Overview
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-xl mt-2">
          Your account information and activity summary
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name || "User"}</h2>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Account Type</span>
              <span className="text-xs font-medium text-gray-900">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Member Since</span>
              <span className="text-xs font-medium text-gray-900">
                {session?.user?.createdAt 
                  ? new Date(session.user.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Status</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Link
            href="/profile/dashboard"
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-700 hover:bg-gray-100 transition text-center"
          >
            View Dashboard
          </Link>
          <Link
            href="/profile/settings"
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-700 hover:bg-gray-100 transition text-center"
          >
            Settings
          </Link>
          <Link
            href="/chat"
            className="rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-4 py-3 text-xs font-medium text-white hover:shadow-lg transition text-center"
          >
            Start Chatting
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <OverviewContent />
    </ProtectedRoute>
  );
}

