"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

export function FinalResponse({ response }) {
  if (!response) return null;

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

        <div className="space-y-3 text-sm md:text-base">
          {response.split("\n\n").map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-slate-800"
            >
              {paragraph}
            </motion.p>
          ))}
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
