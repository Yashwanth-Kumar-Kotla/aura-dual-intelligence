"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CollapsibleResponse({ title, content, titleColor, borderClass, bgClass }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200; // Show first 200 characters
  const shouldTruncate = content && content.length > maxLength;
  const preview = shouldTruncate ? content.substring(0, maxLength) + "..." : content;

  if (!content) return null;

  return (
    <div className={`rounded-2xl border ${borderClass} ${bgClass} px-3 py-3 text-xs md:text-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[11px] uppercase tracking-wide ${titleColor} mb-1 font-semibold`}>
          {title}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-[10px] px-2 py-1 rounded-full border ${borderClass} hover:bg-white/50 transition-colors flex items-center gap-1 text-gray-700`}
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show full <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={isExpanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-800 whitespace-pre-wrap leading-relaxed"
        >
          {isExpanded ? content : preview}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

