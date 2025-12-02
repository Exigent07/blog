import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Code2, Sparkles, Terminal, Loader2 } from "lucide-react"; // Added Loader2
import { motion, AnimatePresence } from "motion/react";
import { handleDownload } from "@/utils/file";
import { explainCode } from "@/app/actions"; // Import the server action
import ReactMarkdown from "react-markdown"; // Optional: for better formatting of AI response

export default function CodeBlock({
  children,
  language = "plaintext",
}: {
  children: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = async () => {
    if (showExplain) {
      setShowExplain(false);
      return;
    }

    if (explanation) {
      setShowExplain(true);
      return;
    }

    setIsExplaining(true);
    setShowExplain(true);

    try {
      const result = await explainCode(children, language);

      if (result) {
        setExplanation(result);
      } else {
        setExplanation(
          "Could not generate an explanation at this time. (API Error or Limit)"
        );
      }
    } catch (error) {
      setExplanation("Error connecting to AI service.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-white/8 bg-black/20">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/2 border-b border-white/6">
        <div className="flex items-center gap-2 text-white/40">
          {language === "bash" ? <Terminal size={13} /> : <Code2 size={13} />}
          <span className="text-xs tracking-wider">{language}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              showExplain
                ? "text-purple-400 bg-white/5"
                : "text-white/50 hover:text-white/80"
            }`}
            title="Explain with AI"
          >
            {isExplaining ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
          </button>
          <button
            onClick={handleDownload.bind(null, language, children)}
            className="p-1 rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
            title="Download"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/80"
          >
            {copied ? (
              <Check size={13} className="text-green-400" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.8125rem",
        }}
      >
        {children}
      </SyntaxHighlighter>

      <AnimatePresence>
        {showExplain && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/6 bg-purple-500/5"
          >
            <div className="p-3 text-xs text-white/70 leading-relaxed">
              <div className="flex items-center gap-1.5 mb-2 text-purple-300 font-medium tracking-wider text-[10px]">
                <Sparkles size={10} />
                AI Explanation
              </div>

              {isExplaining ? (
                <div className="flex items-center gap-2 text-white/40">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap wrap-break-word [&>p]:mb-2 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
