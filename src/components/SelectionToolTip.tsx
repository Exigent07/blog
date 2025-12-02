import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Copy, Check, X, Loader2 } from "lucide-react";
import { explainText } from "@/app/actions";
import ReactMarkdown from "react-markdown";

interface SelectionTooltipProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  postContext?: {
    title: string;
    category: string;
    tags: string[];
  };
}

export default function SelectionTooltip({
  selectedText,
  position,
  onClose,
  postContext,
}: SelectionTooltipProps) {
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(selectedText);
    setCopied(true);
    
    setTimeout(() => {
      onClose();
      setCopied(false);
    }, 1000);
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (explanation) return;

    setIsExplaining(true);
    
    try {
      const result = await explainText(selectedText, postContext);
      if (result) {
        setExplanation(result);
      } else {
        setExplanation("Could not generate explanation.");
      }
    } catch (error) {
      setExplanation("Failed to connect to AI.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed z-50 selection-tooltip"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <motion.div 
        layout
        className="rounded-lg border border-white/10 bg-black/95 backdrop-blur-[100px] overflow-hidden shadow-xl p-1 max-w-[300px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!explanation && !isExplaining ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1 items-center"
            >
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10 text-xs font-medium text-white rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
              
              <div className="w-px bg-white/10 h-4" />
              
              <button
                onClick={handleExplain}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10 text-xs font-medium text-white rounded-md transition-colors cursor-pointer hover:text-purple-300 whitespace-nowrap"
              >
                <Sparkles size={12} />
                Explain
              </button>

              <div className="w-px bg-white/10 h-4" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center justify-center w-7 h-7 hover:bg-white/10 text-white/40 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="explanation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 min-w-[200px]"
            >
              {isExplaining ? (
                <div className="flex items-center gap-2 text-xs text-white/60 py-1">
                  <Loader2 size={12} className="animate-spin text-purple-400" />
                  <span>Analyzing context...</span>
                </div>
              ) : (
                <>
                  <div className="prose prose-invert prose-sm text-xs leading-relaxed text-white/90 mb-2 [&>p]:mb-1 [&>p:last-child]:mb-0 [&>strong]:text-purple-300">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end border-t border-white/10 pt-2 mt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="text-white/40 hover:text-white/80 text-[10px] uppercase tracking-wider font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
