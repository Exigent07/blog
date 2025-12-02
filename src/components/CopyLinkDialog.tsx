import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postUrl: string;
}

export default function CopyLinkDialog({ isOpen, onClose, postTitle, postUrl }: CopyLinkDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-100"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none p-4"
          >
            <div 
              className="relative w-full max-w-lg overflow-hidden rounded-3xl pointer-events-auto"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(80px)",
                WebkitBackdropFilter: "blur(80px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              }}
            >
              {/* Grain texture */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px'
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center group/close transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <X 
                  size={20} 
                  className="text-white/60 group-hover/close:text-white transition-colors group-hover/close:rotate-90 duration-300" 
                />
              </button>

              {/* Content */}
              <div className="relative p-8 md:p-10">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <ExternalLink size={28} className="text-white/80" />
                  </div>
                  <h2 className="text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em', fontWeight: '300' }}>
                    Share Post
                  </h2>
                  <p className="text-white/40 text-sm line-clamp-2 px-4">
                    {postTitle}
                  </p>
                </div>

                {/* Link Display */}
                <div className="mb-6">
                  <div 
                    className="relative rounded-xl p-4 overflow-hidden group/link"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">Link</p>
                        <p className="text-white/90 text-sm truncate font-mono">
                          {postUrl}
                        </p>
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                      }}
                    />
                  </div>
                </div>

                {/* Copy Button */}
                <motion.button
                  onClick={handleCopy}
                  disabled={copied}
                  className="w-full group relative px-8 py-4 border text-white rounded-full overflow-hidden transition-all duration-500"
                  style={{
                    borderColor: copied ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"
                  }}
                  whileHover={!copied ? { scale: 1.02 } : {}}
                  whileTap={!copied ? { scale: 0.98 } : {}}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={18} />
                          Copied to Clipboard!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Copy size={18} />
                          Copy Link
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>

                  {!copied && (
                    <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left -z-10" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
