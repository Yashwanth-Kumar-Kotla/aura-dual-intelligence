"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function FinalResponse({ response }) {
  if (!response) return null;

  // Clean up excessive markdown headings but keep the content
  const cleanedResponse = response
    .split("\n\n")
    .map((paragraph) => {
      // Remove leading markdown headings like "#", "##", etc. but keep the text
      let cleaned = paragraph.replace(/^#{1,6}\s*/g, "").trim();
      return cleaned;
    })
    .filter(Boolean)
    .join("\n\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-6"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl" />

      <div className="relative bg-gradient-to-br from-white via-blue-50/60 to-purple-50/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-xl text-gray-900">
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2">
              Collaborative result
              <Sparkles className="w-4 h-4 text-purple-600" />
            </h3>
            <p className="text-xs md:text-sm text-slate-500">
              Synthesized from GPT-4o mini and Gemini 1.5 Flash
            </p>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-slate-800 leading-relaxed">
          <ReactMarkdown
            components={{
              // Custom styling for markdown elements
              p: ({ children }) => (
                <p className="mb-3 text-slate-800">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-slate-700">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1 ml-4 text-slate-800">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1 ml-4 text-slate-800">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-800">{children}</li>
              ),
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-slate-900 mb-3 mt-4 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-slate-900 mb-2 mt-4 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-slate-900 mb-2 mt-3 first:mt-0">
                  {children}
                </h3>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-600">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-slate-800 overflow-x-auto mb-3">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-300 pl-4 italic text-slate-700 my-3">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-4 border-gray-300" />,
            }}
          >
            {cleanedResponse}
          </ReactMarkdown>
        </div>

        <div className="flex justify-center mt-5 pt-5 border-t border-slate-200/70">
          <div className="flex items-center gap-4">
            {[0, 0.4, 0.8].map((delay, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay
                }}
                className={`w-2 h-2 rounded-full ${
                  i === 0
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : i === 1
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
