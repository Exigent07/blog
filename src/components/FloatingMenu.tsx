"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, Share2, BookOpen, Plus, X, AArrowUp, AArrowDown, ALargeSmall, User } from "lucide-react";
import { toast } from "sonner";
import { useUI } from "@/contexts/UIContext";
import { usePathname, useRouter } from "next/navigation";

export function FloatingMenu() {
  const { setSelectionMode, readingMode, setReadingMode } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");

  const isPostPage = pathname.startsWith("/posts/");
  const isListPage = pathname === "/" || pathname === "/posts";

  const getFontIcon = () => {
    switch (fontSize) {
      case "small": return AArrowDown;
      case "large": return AArrowUp;
      default: return ALargeSmall;
    }
  };

  const cycleFontSize = () => {
    const sizes: ("small" | "medium" | "large")[] = ["small", "medium", "large"];
    const currentIndex = sizes.indexOf(fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    setFontSize(nextSize);
    document.documentElement.style.fontSize = 
      nextSize === "small" ? "14px" : nextSize === "large" ? "18px" : "16px";
    
    toast.success(`Text size changed to ${nextSize}`);
  };

  const toggleReadingMode = () => {
    if (!isPostPage) {
      toast.error("Select a post to turn on reading mode", {
        description: "Navigate to a blog post first",
        duration: 3000,
      });
      return;
    }
    setReadingMode(!readingMode);
  };

  const handleShare = () => {
    if (isPostPage) {
      if (navigator.share) {
        navigator.share({ title: "Blog Post", url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
      return;
    }

    if (isListPage) {
      setSelectionMode(true);
      setIsOpen(false);
      toast.success("Selection mode activated", {
        description: "Click on a post to share"
      });
      return;
    }

    toast.error("No posts found to share", {
      description: "Go to Home or All Posts to share items"
    });
  };

  const menuItems = [
    { icon: Book, label: "Posts", action: () => {
      router.push("/posts");
      setIsOpen(false);
    }},
    { icon: User, label: "About", action: () => {
      router.push("/about");
      setIsOpen(false);
    }},
    { icon: Share2, label: "Share", action: handleShare },
    { 
      icon: BookOpen, 
      label: "Reading Mode", 
      action: toggleReadingMode,
      active: readingMode
    },
    { 
      icon: getFontIcon(), 
      label: `Text Size: ${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`, 
      action: cycleFontSize
    },
  ];

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden group"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <div 
          className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)",
          }}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "open" : "closed"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {isOpen ? (
              <X size={18} className="text-white/90" />
            ) : (
              <Plus size={18} className="text-white/90" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {menuItems.map((item, index) => {
              const y = -(index + 1) * 56;

              return (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className="absolute w-10 h-10 rounded-full flex items-center justify-center group/item"
                  style={{
                    background: item.active 
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)",
                    border: item.active 
                      ? "1px solid rgba(255,255,255,0.25)"
                      : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    left: "50%",
                    top: "50%",
                    marginLeft: "-20px",
                    marginTop: "-20px"
                  }}
                  initial={{ 
                    y: 0, 
                    scale: 0,
                    opacity: 0 
                  }}
                  animate={{ 
                    y, 
                    scale: 1,
                    opacity: 1 
                  }}
                  exit={{ 
                    y: 0, 
                    scale: 0,
                    opacity: 0 
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    delay: index * 0.03
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon 
                    size={16} 
                    className="text-white/80 group-hover/item:text-white transition-colors" 
                  />

                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-full whitespace-nowrap text-xs text-white pointer-events-none opacity-0 group-hover/item:opacity-100 transition-all duration-200"
                    style={{
                      background: "rgba(0,0,0,0.9)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      transitionProperty: "opacity, transform"
                    }}
                  >
                    {item.label}
                  </div>
                </motion.button>
              );
            })}

            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-px"
              style={{
                background: "linear-gradient(to top, rgba(255,255,255,0.15), rgba(255,255,255,0.05), transparent)",
                top: "50%",
                marginTop: "-20px"
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: menuItems.length * 56 + 10, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
