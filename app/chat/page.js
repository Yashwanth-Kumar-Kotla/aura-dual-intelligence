"use client";

import { useState } from "react";
import { FinalResponse } from "../../components/FinalResponse";
import { LoadingAnimation } from "../../components/LoadingAnimation";
import { CollapsibleResponse } from "../../components/CollapsibleResponse";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question })
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle API errors
        const errorMessage = data.error || data.details || "Unknown error occurred";
        setExchanges(prev => [
          ...prev,
          {
            user: question,
            gpt: "Error: " + errorMessage,
            gemini: "Error: " + errorMessage,
            final: `Error: ${errorMessage}. Please check your API keys and try again.`
          }
        ]);
        return;
      }

      setExchanges(prev => [
        ...prev,
        {
          user: question,
          gpt: data.gptReply || "No response from GPT-4o mini.",
          gemini: data.geminiReply || "No response from Gemini 1.5 Flash.",
          final: data.finalReply || "No synthesis available."
        }
      ]);
    } catch (err) {
      console.error(err);
      setExchanges(prev => [
        ...prev,
        {
          user: question,
          gpt: "Network error: " + err.message,
          gemini: "Network error: " + err.message,
          final: "Something went wrong. Check your API keys and network connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-blue-600 mb-1 font-semibold">
            Collaborative chat
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Ask anything. Watch GPT + Gemini discuss it.
          </h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-xl mt-2">
            Your question is sent to GPT-4o mini and Gemini 1.5 Flash.
            They each respond, then Aura Duo synthesizes a final answer for you.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        {/* left: conversation */}
        <div className="space-y-6">
          {loading && <LoadingAnimation />}

          {exchanges.length === 0 && !loading && (
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 px-4 py-3 text-xs text-gray-600 shadow-sm">
              Try something like:{" "}
              <span className="text-gray-900 font-medium">
                "Help me design a 4‑week ML study plan while I&apos;m in grad school."
              </span>
            </div>
          )}

          {exchanges.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg p-4 md:p-5 space-y-3"
            >
              <div className="text-xs text-gray-500 mb-1 font-medium">You asked</div>
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 text-sm text-gray-900 border border-gray-200">
                {ex.user}
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <CollapsibleResponse
                  title="GPT model"
                  content={ex.gpt}
                  titleColor="text-emerald-600"
                  borderClass="border-emerald-300/50"
                  bgClass="bg-emerald-50/30"
                />
                <CollapsibleResponse
                  title="Gemini model"
                  content={ex.gemini}
                  titleColor="text-indigo-600"
                  borderClass="border-indigo-300/50"
                  bgClass="bg-indigo-50/30"
                />
              </div>

              <FinalResponse response={ex.final} />
            </div>
          ))}
        </div>

        {/* right: input + tips */}
        <div className="sticky top-24 space-y-4">
          <form
            onSubmit={handleSend}
            className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-xl shadow-xl p-4 space-y-3"
          >
            <label className="text-xs font-medium text-gray-700">
              Ask Aura Duo
            </label>
            <textarea
              rows={4}
              className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition"
              placeholder="Ask a question you'd want both models to think about…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium py-2.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </span>
              ) : (
                "Send to GPT + Gemini"
              )}
            </button>
          </form>

          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-4 text-[11px] text-gray-600 space-y-2 shadow-sm">
            <p className="font-semibold text-xs text-gray-900">
              API keys required
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Set <code className="text-blue-600 bg-blue-50 px-1 rounded">OPENAI_API_KEY</code> for GPT‑4o mini.</li>
              <li>Set <code className="text-purple-600 bg-purple-50 px-1 rounded">GEMINI_API_KEY</code> for Gemini 1.5 Flash.</li>
              <li>No data is stored by this app — requests go directly to the providers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
