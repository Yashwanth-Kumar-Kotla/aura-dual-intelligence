"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">
            Dual AI • GPT-4o mini + Gemini 1.5
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Two AIs. <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">One answer</span> you can trust.
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            Aura Duo lets GPT-4o mini and Gemini 1.5 Flash analyze your question together.
            They compare, critique, and synthesize a final answer — so you get clarity
            instead of guesswork.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              Launch collaborative chat
            </Link>
            <span className="text-xs text-gray-500">
              Uses your own OpenAI + Gemini API keys. Answers stay in your browser.
            </span>
          </div>
        </div>

        {/* mini conversation demo */}
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <div className="space-y-4">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-400/60 text-[10px] text-blue-600 bg-blue-50">
                ⚡
              </span>
              AI Collaboration
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200/50 px-4 py-3 text-xs shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-emerald-600 mb-1 font-semibold">
                  GPT model
                </p>
                <p className="text-gray-800">
                  From my analysis, the optimal study plan is 2–3 focused hours a day with weekly review.
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-50/50 border border-indigo-200/50 px-4 py-3 text-xs shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-indigo-600 mb-1 font-semibold">
                  Gemini model
                </p>
                <p className="text-gray-800">
                  I agree, and I&apos;d add spaced repetition and quick reflection notes to lock in what you learn.
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80 border border-blue-200/60 px-4 py-3 text-xs shadow-md">
                <p className="text-[11px] uppercase tracking-wide text-blue-600 mb-1 font-semibold">
                  Collaborative result
                </p>
                <p className="text-gray-900">
                  Study 2–3 focused hours daily, add weekly reviews, and use spaced repetition plus
                  quick reflection notes after each session.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-600">
            <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-[10px] bg-white shadow-sm">
                ①
              </span>
              Quick Overview
            </p>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">1. GPT analyzes</p>
                <p className="text-gray-600">
                  GPT-4o mini generates a fast, structured first pass — outlining reasoning, edge cases,
                  and key assumptions.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">2. Gemini reviews</p>
                <p className="text-gray-600">
                  Gemini 1.5 critiques GPT&apos;s answer, checks for gaps or hallucinations, and suggests improvements.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">3. Final synthesis</p>
                <p className="text-gray-600">
                  You receive a single, clean answer that combines both models&apos; strengths — plus the
                  option to inspect their individual thoughts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-gray-200/50 bg-gradient-to-b from-white to-blue-50/20">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold mb-3">
            Process
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-5">
            How Aura Duo Works
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            A step-by-step look at how two AI models collaborate to give you the best answer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">You Ask</h3>
              </div>
              <p className="text-gray-600 text-base mb-5 leading-relaxed">
                Submit your question to Aura Duo. Your query is sent to both AI models simultaneously for parallel processing.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 border border-blue-100">
                <strong>Example:</strong> "Help me design a 4-week ML study plan while I'm in grad school."
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 hidden md:block">
              <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">GPT-4o mini</p>
                  <p className="text-sm text-gray-700 leading-relaxed">Provides a structured first-pass answer with reasoning and assumptions.</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">Gemini 1.5 Flash</p>
                  <p className="text-sm text-gray-700 leading-relaxed">Critiques and reviews, checking for gaps, edge cases, and potential improvements.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 hidden md:block">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Synthesis</h3>
              </div>
              <p className="text-gray-600 text-base mb-5 leading-relaxed">
                GPT synthesizes both responses into one polished answer, combining their strengths and resolving any disagreements.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-sm text-gray-700 border border-blue-100">
                <strong>Result:</strong> A comprehensive, balanced answer with the option to view each model's individual thoughts.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-base text-gray-900 mb-2">Parallel Processing</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Both AIs work simultaneously, saving time and providing diverse perspectives instantly.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-base text-gray-900 mb-2">Quality Check</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Gemini acts as a quality reviewer, catching errors, gaps, and suggesting improvements.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="font-semibold text-base text-gray-900 mb-2">Transparency</h4>
            <p className="text-sm text-gray-600 leading-relaxed">See both individual responses and the final synthesized answer for complete transparency.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
