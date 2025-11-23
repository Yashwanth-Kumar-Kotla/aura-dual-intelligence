"use client";

/**
 * Profile Dashboard Page
 * 
 * Shows user activity, statistics, and recent interactions.
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { data: session } = useSession();
  const [stats, setStats] = useState([
    { label: "Total Chats", value: "0", icon: "💬" },
    { label: "Questions Asked", value: "0", icon: "❓" },
    { label: "AI Responses", value: "0", icon: "🤖" },
    { label: "Account Age", value: "New", icon: "📅" },
  ]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/chat/history");
        if (res.ok) {
          const data = await res.json();
          const chats = data.chats || [];
          
          // Calculate stats
          const totalChats = chats.length;
          const questionsAsked = totalChats;
          const aiResponses = totalChats * 3; // GPT + Gemini + Final = 3 responses per chat
          
          // Get account age (mock for now, could add to user data)
          const accountAge = "Active";

          setStats([
            { label: "Total Chats", value: totalChats.toString(), icon: "💬" },
            { label: "Questions Asked", value: questionsAsked.toString(), icon: "❓" },
            { label: "AI Responses", value: aiResponses.toString(), icon: "🤖" },
            { label: "Account Status", value: accountAge, icon: "📅" },
          ]);

          // Get recent chats (last 5)
          setRecentChats(chats.slice(-5).reverse());
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadStats();
    }
  }, [session]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-blue-600 mb-1 font-semibold">
          Dashboard
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Your Activity
        </h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-xl mt-2">
          Track your usage and interactions with Aura Duo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {loading ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600 text-center">
            Loading...
          </div>
        ) : recentChats.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600 text-center">
            No activity yet. Start chatting to see your history here!
          </div>
        ) : (
          <div className="space-y-3">
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs"
              >
                <p className="font-medium text-gray-900 mb-1 truncate">{chat.user}</p>
                <p className="text-gray-500 text-[10px]">
                  {new Date(chat.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Get Started</h3>
        <p className="text-xs text-gray-600 mb-4">
          Ready to experience dual AI intelligence? Start a conversation now.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-medium px-5 py-2.5 hover:shadow-lg transition-all hover:scale-105"
        >
          Launch Chat
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

