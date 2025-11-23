"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function CollapsibleResponse({ title, content, titleColor, borderClass, bgClass }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200; // Show first 200 characters
  const shouldTruncate = content && content.length > maxLength;
  
  // Clean up excessive markdown headings but keep the content
  const cleanedContent = content
    .split("\n\n")
    .map((paragraph) => {
      // Remove leading markdown headings like "#", "##", etc. but keep the text
      let cleaned = paragraph.replace(/^#{1,6}\s*/g, "").trim();
      return cleaned;
    })
    .filter(Boolean)
    .join("\n\n");
  
  const preview = shouldTruncate ? cleanedContent.substring(0, maxLength) + "..." : cleanedContent;
  const displayContent = isExpanded ? cleanedContent : preview;

  if (!content) return null;

  return (
    <div className={`rounded-2xl border ${borderClass} ${bgClass} px-4 py-3 text-xs md:text-sm`}>
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
        <motion.div
          key={isExpanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
        >
          <ReactMarkdown
            components={{
              // Custom styling for markdown elements
              p: ({ children }) => (
                <p className="mb-2 text-gray-800 text-xs md:text-sm">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-700">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1 ml-3 text-gray-800">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1 ml-3 text-gray-800">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-800 text-xs md:text-sm">{children}</li>
              ),
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-gray-900 mb-2 mt-3 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-semibold text-gray-900 mb-1 mt-2 first:mt-0">
                  {children}
                </h3>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono text-blue-600">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-gray-100 p-2 rounded text-[10px] font-mono text-gray-800 overflow-x-auto mb-2">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-gray-300 pl-3 italic text-gray-700 my-2 text-xs">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-2 border-gray-300" />,
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

