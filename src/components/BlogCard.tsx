import CardButton from "@/components/CardButton";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import type { PostData } from "@/lib/posts";

export default function BlogCard({
  post,
  selectionMode,
  setSelectedPost,
  setShowCopyDialog,
  onExitSelectionMode,
}: {
  post: PostData & { span?: string };
  selectionMode: boolean;
  setSelectedPost?: (post: PostData) => void;
  setShowCopyDialog?: (show: boolean) => void;
  onExitSelectionMode?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [mousePercent, setMousePercent] = useState({ x: 50, y: 50 });

  const handlePostSelect = (post: PostData) => {
    if (selectionMode) {
      setSelectedPost?.(post);
      setShowCopyDialog?.(true);
      onExitSelectionMode?.();
    } else {
      if (post === null) return;
      router.push(`/posts/${encodeURIComponent(post.title)}?from=posts`);
    }
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `/posts/${encodeURIComponent(post.title)}?from=posts`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/posts?q=category:"${encodeURIComponent(category)}"`);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = rect.width ? (x / rect.width) * 100 : 50;
    const yPct = rect.height ? (y / rect.height) * 100 : 50;
    setMousePercent({ x: xPct, y: yPct });
  };

  const xPercent = mousePercent.x;
  const yPercent = mousePercent.y;

  const tiltX = isHovered ? (yPercent - 50) / 25 : 0;
  const tiltY = isHovered ? (50 - xPercent) / 25 : 0;

  const spanClass = post.span || "";
  const isLargeCard = spanClass.includes("col-span-2");
  const isTallCard = spanClass.includes("row-span-2");

  return (
    <article
      ref={cardRef}
      data-blog-card
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePostSelect.bind(null, post)}
      className={`group relative cursor-pointer ${spanClass}`}
      style={{ perspective: "1500px" }}
    >
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute -inset-[3px] z-20 rounded-[20px] pointer-events-none transition-transform duration-500 ease-out"
            style={{
              border: "2px dotted rgba(255, 255, 255, 0.3)",
              background: "transparent",
              transform: `
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
                translateY(${isHovered ? "-6px" : "0px"})
                scale(${isHovered ? "1.01" : "1"})
              `,
              transformStyle: "preserve-3d",
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="absolute -inset-2 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
          filter: "blur(25px)",
        }}
      ></div>

      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-500 ease-out"
        style={{
          transform: `
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            translateY(${isHovered ? "-6px" : "0px"})
            scale(${isHovered ? "1.01" : "1"})
          `,
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? `0 25px 50px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15), ${
                -tiltY * 2
              }px ${tiltX * 2}px 30px rgba(255,255,255,0.05)`
            : "0 10px 20px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute inset-0 backdrop-blur-[80px] bg-black/60 transition-transform duration-500"
          style={{
            transform: `translateZ(-10px)`,
          }}
        ></div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
          style={{
            background: `linear-gradient(${
              135 + tiltY * 5
            }deg, rgba(255,255,255,0.05) 0%, transparent 100%)`,
            transform: `translateZ(-5px) skewY(${tiltY * 0.3}deg)`,
          }}
        ></div>

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        ></div>

        <div
          className="relative h-full p-6 lg:p-8 flex flex-col justify-between z-10 transition-transform duration-500"
          style={{
            transform: `translateZ(20px)`,
          }}
        >
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-auto">
              <div className="flex-1 min-w-0">
                <div className="inline-block mb-4">
                  <button
                    className="inline-block px-4 py-2 rounded-full text-white/60 text-xs tracking-widest uppercase relative transition-all duration-500 hover:text-white/80 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(post.category);
                    }}
                  >
                    {post.category}
                  </button>
                </div>

                <h3
                  className="text-white/90 transition-all duration-500 group-hover:text-white mb-2"
                  style={{
                    fontSize: isLargeCard
                      ? "clamp(1.25rem, 2vw, 1.75rem)"
                      : "clamp(1rem, 1.5vw, 1.25rem)",
                    lineHeight: "1.3",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {post.title}
                </h3>
                {isTallCard ? (
                  <p
                    className="text-white/40 leading-relaxed transition-all duration-500 group-hover:text-white/60 mb-4"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.excerpt} 
                  </p>
                ) : null}
              </div>

              <div
                ref={openRef}
                onClick={handleOpenNewTab}
                className="cursor-pointer"
              >
                <CardButton />
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/30 text-sm mt-6 pt-4 relative transition-all duration-500 group-hover:text-white/60">
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
              <button
                className="hover:text-white/80 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateClick(post.date);
                }}
              >
                {post.date}
              </button>
              <span>·</span>
              <button
                className="hover:text-white/80 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadTimeClick(post.readTime);
                }}
              >
                {post.readTime}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
