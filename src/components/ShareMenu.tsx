import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";

export default function ShareMenu({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        setIsOpen(false);
      } catch (err) {
        console.error("Failed to share:", err);
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5 backdrop-blur-[80px] transition-all duration-300"
      >
        <Share2 size={14} className="text-white/60" />{" "}
        <span className="text-xs text-white/60">Share</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-white/10 bg-black/95 backdrop-blur-[100px] overflow-hidden z-50 shadow-xl"
          >
            <div className="p-1">
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white text-xs"
              >
                <Share2 size={12} />
                <span>Share...</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white text-xs"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
