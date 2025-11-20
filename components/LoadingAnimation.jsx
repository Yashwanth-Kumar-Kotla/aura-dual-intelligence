"use client";

import { motion } from "framer-motion";

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
      {/* Animated circles container with fixed width */}
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            style={{
              x: Math.cos((i * 2 * Math.PI) / 3) * 24,
              y: Math.sin((i * 2 * Math.PI) / 3) * 24,
            }}
          />
        ))}
      </div>

      {/* Pulsing text - centered */}
      <motion.div
        className="text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Thinking together…
      </motion.div>

      {/* Progress bar animation - centered */}
      <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
}

