"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, MessageSquare } from "lucide-react";
import { FinalResponse } from "../../components/FinalResponse";
import { LoadingAnimation } from "../../components/LoadingAnimation";
import { CollapsibleResponse } from "../../components/CollapsibleResponse";
import ProtectedRoute from "../../components/ProtectedRoute";

function ChatPageContent() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Load sessions when component mounts
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/chat/sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions);
            // Select the most recent session
            const mostRecent = data.sessions.sort((a, b) => 
              new Date(b.updatedAt) - new Date(a.updatedAt)
            )[0];
            setCurrentSessionId(mostRecent.id);
            setExchanges(mostRecent.chats || []);
          }
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    }

    if (session) {
      loadSessions();
    }
  }, [session]);

  // Load chats when session changes
  useEffect(() => {
    if (!currentSessionId) return;

    async function loadSessionChats() {
      try {
        const res = await fetch(`/api/chat/sessions/${currentSessionId}`);
        if (res.ok) {
          const data = await res.json();
          setExchanges(data.chats || []);
        }
      } catch (error) {
        console.error("Error loading session chats:", error);
      }
    }

    loadSessionChats();
  }, [currentSessionId]);

  // Auto-scroll to bottom when new exchange is added
  useEffect(() => {
    if (contentRef.current && exchanges.length > 0) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [exchanges.length]);

  // Helper to get question label
  const getQuestionLabel = (question) => {
    const words = question.split(" ").slice(0, 4).join(" ");
    return words.length < question.length ? `${words}...` : words;
  };

  // Create new session
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: null }) // Auto-generate name
      });

      if (res.ok) {
        const data = await res.json();
        const newSession = data.session;
        setSessions(prev => [...prev, newSession]);
        setCurrentSessionId(newSession.id);
        setExchanges([]);
        setInput("");
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Update session name
  const handleUpdateSessionName = async (sessionId, newName) => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: newName })
      });

      if (res.ok) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
        ));
        setEditingSessionId(null);
      }
    } catch (error) {
      console.error("Error updating session name:", error);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const remaining = sessions.filter(s => s.id !== sessionId);
          if (remaining.length > 0) {
            setCurrentSessionId(remaining[0].id);
          } else {
            setCurrentSessionId(null);
            setExchanges([]);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Switch to a session
  const handleSwitchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setEditingSessionId(null);
  };

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || loading || !currentSessionId) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    // Build conversation history for context
    const conversationHistory = exchanges.map(ex => ({
      question: ex.user,
      answer: ex.final
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: question,
          conversationHistory: conversationHistory
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || data.details || "Unknown error occurred";
        const errorExchange = {
          id: Date.now().toString(),
          user: question,
          gpt: "Error: " + errorMessage,
          gemini: "Error: " + errorMessage,
          final: `Error: ${errorMessage}. Please check your API keys and try again.`,
          timestamp: new Date().toISOString()
        };
        setExchanges(prev => [...prev, errorExchange]);
        setLoading(false);
        return;
      }

      const newExchange = {
        id: Date.now().toString(),
        user: question,
        gpt: data.gptReply || "No response from GPT-4o mini.",
        gemini: data.geminiReply || "No response from Gemini 1.5 Flash.",
        final: data.finalReply || "No synthesis available.",
        timestamp: new Date().toISOString()
      };

      setExchanges(prev => [...prev, newExchange]);

      // Save to session
      try {
        await fetch("/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: newExchange.user,
            gpt: newExchange.gpt,
            gemini: newExchange.gemini,
            final: newExchange.final,
            sessionId: currentSessionId
          })
        });
      } catch (err) {
        console.error("Error saving chat:", err);
      }
    } catch (err) {
      console.error(err);
      const errorExchange = {
        id: Date.now().toString(),
        user: question,
        gpt: "Network error: " + err.message,
        gemini: "Network error: " + err.message,
        final: "Something went wrong. Check your API keys and network connection.",
        timestamp: new Date().toISOString()
      };
      setExchanges(prev => [...prev, errorExchange]);
    } finally {
      setLoading(false);
    }
  }

  // Memoize exchanges to prevent flickering
  const memoizedExchanges = useMemo(() => exchanges, [exchanges.map(e => e.id).join(',')]);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sessions & Questions */}
        <div className="w-80 border-r border-gray-200 bg-white/50 backdrop-blur-sm flex flex-col">
          {/* Header with New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Sessions List - Scrollable */}
          <div 
            ref={sidebarRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {loadingSessions ? (
              <div className="text-xs text-gray-500 text-center py-4">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8">
                <p>No chats yet.</p>
                <p className="mt-2">Click "New Chat" to start!</p>
              </div>
            ) : (
              <>
                {sessions
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSwitchSession(session.id)}
                      className={`rounded-xl border px-3 py-2.5 transition-all cursor-pointer group ${
                        currentSessionId === session.id
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {editingSessionId === session.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => {
                                if (editingName.trim()) {
                                  handleUpdateSessionName(session.id, editingName.trim());
                                } else {
                                  setEditingSessionId(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (editingName.trim()) {
                                    handleUpdateSessionName(session.id, editingName.trim());
                                  }
                                } else if (e.key === "Escape") {
                                  setEditingSessionId(null);
                                }
                              }}
                              autoFocus
                              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none p-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {session.name}
                              </div>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(session.id);
                              setEditingName(session.name);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* Question List for Current Session */}
            {currentSessionId && exchanges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-3 px-1">
                  Questions in this chat
                </div>
                {exchanges.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 mb-2"
                  >
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Question {idx + 1}
                    </div>
                    <div className="text-sm text-gray-900 line-clamp-2 leading-snug">
                      {getQuestionLabel(ex.user)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(ex.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {loading && currentSessionId && (
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-2.5 mt-4">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Question {exchanges.length + 1}
                </div>
                <div className="text-sm text-gray-900 line-clamp-2">
                  {input || "Processing..."}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input at Bottom */}
          <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
            {!currentSessionId ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-3">
                  Create a new chat to start asking questions
                </p>
                <button
                  onClick={handleNewChat}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-medium py-2 hover:shadow-lg transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-2">
                <textarea
                  ref={inputRef}
                  rows={3}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition resize-none"
                  placeholder="Ask a follow-up question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-medium py-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </span>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Main Content Area - All Conversations Stacked */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30"
        >
          {loadingSessions ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : !currentSessionId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a new chat
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click "New Chat" to begin a conversation with GPT and Gemini.
                </p>
                <button
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium px-5 py-2.5 hover:shadow-lg transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>
            </div>
          ) : exchanges.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-sm text-gray-600">
                  Ask a question to see GPT and Gemini collaborate on an answer.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Show all exchanges stacked */}
              {memoizedExchanges.map((exchange, idx) => (
                <motion.div
                  key={exchange.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  className="space-y-4"
                >
                  {/* Question at Top */}
                  <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-3">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Question {idx + 1}</div>
                    <div className="text-sm md:text-base text-gray-900 font-medium">
                      {exchange.user}
                    </div>
                  </div>

                  {/* GPT and Gemini Models - Side by Side */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <CollapsibleResponse
                      title="GPT Model"
                      content={exchange.gpt}
                      titleColor="text-emerald-600"
                      borderClass="border-emerald-300/50"
                      bgClass="bg-emerald-50/30"
                    />
                    <CollapsibleResponse
                      title="Gemini Model"
                      content={exchange.gemini}
                      titleColor="text-indigo-600"
                      borderClass="border-indigo-300/50"
                      bgClass="bg-indigo-50/30"
                    />
                  </div>

                  {/* Collaborative Result - Full Width */}
                  <FinalResponse response={exchange.final} />

                  {/* Divider between conversations */}
                  {idx < memoizedExchanges.length - 1 && (
                    <div className="border-t border-gray-200 pt-6"></div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator for current question */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-3">
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      Question {exchanges.length + 1}
                    </div>
                    <div className="text-sm md:text-base text-gray-900 font-medium">
                      {input || "Processing your question..."}
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-12">
                    <LoadingAnimation />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
