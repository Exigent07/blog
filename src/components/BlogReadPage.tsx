"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, BookOpen, Eye, X, SearchX } from "lucide-react";
import CreativeButton from "@/components/CreativeButton";
import BlogCard from "@/components/BlogCard";
import ShareMenu from "@/components/ShareMenu";
import TableOfContents, {
  TableOfContentsItem,
} from "@/components/TableOfContent";
import SelectionTooltip from "@/components/SelectionToolTip";
import { useRouter, useSearchParams } from "next/navigation";
import { components, getHeadingIcon } from "@/utils/md";
import type { PostData } from "@/lib/posts";

interface BlogReadPageProps {
  post: PostData;
  similarPosts: PostData[];
  onBack: () => void;
  readingMode?: boolean;
  onReadingModeChange?: (mode: boolean) => void;
}

function ReadingProgress({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-black/20">
      <motion.div
        className="h-full bg-white/40"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 15px rgba(255,255,255,0.3)",
        }}
      />
    </div>
  );
}

export function BlogReadPage({
  post,
  similarPosts,
  readingMode,
  onReadingModeChange,
}: BlogReadPageProps) {
  const [readProgress, setReadProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const referrer = searchParams.get("from");
  const shareURL = typeof window !== "undefined" ? window.location.href : "";

  const handleBackClick = () =>
    referrer === "/posts" ? router.push("/posts") : router.push("/");

  const handleTagClick = (tag: string) =>
    router.push(`/posts?q=tag:"${encodeURIComponent(tag)}"`);

  const handleCategoryClick = () => {
    router.push(`/posts?q=category:"${encodeURIComponent(post.category)}"`);
  };

  const handleDateClick = (date: string) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    router.push(`/posts?q=year:${year}`);
  };

  const handleReadTimeClick = (readTime: string) => {
    const match = readTime.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      router.push(`/posts?q=readtime:<${minutes + 1}`);
    }
  };

  const tableOfContents = useMemo(() => {
    const headingRegex = /^(#{1,6})\s+([^\n]+)$/gm;
    const toc: TableOfContentsItem[] = [];
    let match;
    while ((match = headingRegex.exec(post.content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      toc.push({
        id: title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
        title,
        level,
        icon: getHeadingIcon(title),
      });
    }
    return toc;
  }, [post.content]);

  const handleScroll = useCallback(() => {
    if (showTooltip) setShowTooltip(false);

    if (!contentRef.current) return;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    setReadProgress(
      Math.min(
        100,
        Math.max(0, (scrollTop / (documentHeight - windowHeight)) * 100)
      )
    );

    const triggerPoint = 150;
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let current = "";
    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top < triggerPoint)
        current = heading.id;
    });
    if (current) setActiveSection(current);
  }, [showTooltip]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => setShowTooltip(false));
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => setShowTooltip(false));
    };
  }, [handleScroll]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest(".selection-tooltip")) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (
        text &&
        text.length > 2 &&
        contentRef.current?.contains(
          selection?.anchorNode?.parentElement || null
        )
      ) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect && rect.width > 0) {
          const GAP = 12;
          setSelectedText(text);
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - GAP,
          });
          setShowTooltip(true);
        }
      } else {
        setShowTooltip(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".selection-tooltip")) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <>
      <ReadingProgress progress={readProgress} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full py-40 px-4 relative"
      >
        <div className="container mx-auto max-w-7xl">
          <AnimatePresence>
            {!readingMode && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8"
                >
                  <CreativeButton icon="left" onClick={handleBackClick}>
                    Back
                  </CreativeButton>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      onClick={handleCategoryClick}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white/60 hover:text-white/80 hover:bg-white/10 hover:border-white/20 text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {post.category}
                    </button>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <button
                        onClick={() => handleDateClick(post.date)}
                        className="flex items-center gap-1.5 hover:text-white/60 transition-colors cursor-pointer"
                      >
                        <Calendar size={12} />
                        <span>{post.date}</span>
                      </button>
                      <button
                        onClick={() => handleReadTimeClick(post.readTime)}
                        className="flex items-center gap-1.5 hover:text-white/60 transition-colors cursor-pointer"
                      >
                        <Clock size={12} />
                        <span>{post.readTime}</span>
                      </button>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => onReadingModeChange?.(!readingMode)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5 backdrop-blur-[80px] transition-all duration-300"
                      >
                        <Eye size={14} className="text-white/60" />
                        <span className="text-xs text-white/60">
                          Reading Mode
                        </span>
                      </button>
                      <ShareMenu url={shareURL} title={post.title} />
                    </div>
                  </div>

                  <h1
                    className="text-white mb-6"
                    style={{
                      fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs transition-all duration-300 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {readingMode && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => onReadingModeChange?.(false)}
                className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5 backdrop-blur-[80px] transition-all duration-300"
              >
                <X size={14} className="text-white/60" />
                <span className="text-xs text-white/80">Exit</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div
            className={`grid gap-8 ${
              readingMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"
            }`}
          >
            {!readingMode && (
              <aside
                className={`hidden lg:block ${
                  isTocCollapsed ? "lg:col-span-1" : "lg:col-span-3"
                }`}
              >
                <TableOfContents
                  items={tableOfContents}
                  activeId={activeSection}
                  isCollapsed={isTocCollapsed}
                  onToggle={() => setIsTocCollapsed(!isTocCollapsed)}
                />
              </aside>
            )}

            <div
              className={
                readingMode
                  ? "max-w-3xl mx-auto"
                  : isTocCollapsed
                  ? "lg:col-span-11"
                  : "lg:col-span-9"
              }
            >
              <article ref={contentRef} className="relative">
                <div className="blog-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={components}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </article>

              {!readingMode && (
                <div className="mt-8 pt-20 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="text-white/60" size={20} />
                    <h2 className="text-xl font-semibold text-white/90">
                      Similar Reads
                    </h2>
                  </div>

                  {similarPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarPosts.map((post) => (
                        <BlogCard
                          key={post.slug}
                          post={post}
                          selectionMode={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full rounded-xl border border-white/10 bg-white/2 p-12 text-center flex flex-col items-center justify-center gap-4">
                      <div className="p-4 rounded-full bg-white/5 text-white/30">
                        <SearchX size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white/80 mb-1">
                          No Similar Posts Found
                        </h3>
                        <p className="text-white/40 text-sm">
                          Check back later for more content in this category.
                        </p>
                      </div>
                      <CreativeButton href="/posts">
                        Browse All Posts
                      </CreativeButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showTooltip && (
          <SelectionTooltip
            selectedText={selectedText}
            position={tooltipPosition}
            onClose={() => setShowTooltip(false)}
            postContext={{
              title: post.title,
              category: post.category,
              tags: post.tags,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
