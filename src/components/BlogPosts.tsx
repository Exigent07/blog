"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CopyLinkDialog from "@/components/CopyLinkDialog";
import CreativeButton from "@/components/CreativeButton";
import PageTitle from "@/components/PageTitle";
import BlogCard from "@/components/BlogCard";
import { motion } from "motion/react";
import type { PostData } from "@/lib/posts";
import { ChevronRight, Sparkle } from "lucide-react";

const SPAN_PATTERN = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-1",
];

const HOT_TOPICS = ["CTF", "Bug Bounty"];

interface BlogPostsProps {
  posts: PostData[];
  selectionMode: boolean;
  onExitSelectionMode: () => void;
}

export default function BlogPosts({
  posts,
  selectionMode,
  onExitSelectionMode,
}: BlogPostsProps) {
  const router = useRouter();
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  const featuredPosts = posts.slice(0, 7).map((post, index) => ({
    ...post,
    span: SPAN_PATTERN[index] || "md:col-span-1 md:row-span-1",
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectionMode) {
        onExitSelectionMode();
      }
    };

    if (selectionMode) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectionMode, onExitSelectionMode]);

  useEffect(() => {
    if (selectionMode) {
      const postsSection = document.getElementById("posts");
      if (postsSection) {
        postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectionMode]);

  const handleTopicClick = (topic: string) => {
    router.push(`/posts?q=category:"${topic}"`);
  };

  return (
    <>
      <CopyLinkDialog
        isOpen={showCopyDialog}
        onClose={() => {
          setShowCopyDialog(false);
          setSelectedPost(null);
        }}
        postTitle={selectedPost?.title || ""}
        postUrl={
          selectedPost
            ? `${window.location.origin}/posts/${encodeURIComponent(
                selectedPost.title
              )}`
            : ""
        }
      />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        id="posts"
        className={`relative py-40 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex flex-col justify-center ${
          selectionMode ? "z-45" : ""
        }`}
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <PageTitle mainText="Featured" accentText="Posts" />
            </motion.div>

            <div className="flex items-center gap-4">
              <CreativeButton href="/about">About</CreativeButton>
              <CreativeButton href="/posts">View All</CreativeButton>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-mono text-white/30 uppercase flex items-center gap-2 shrink-0">
              <Sparkle size={12} />
              Quick Filter:
            </span>
            <div className="flex gap-2">
              {HOT_TOPICS.map((topic, i) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[11px] text-white/60 hover:text-white transition-all whitespace-nowrap uppercase tracking-wider"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 auto-rows-[280px]">
            {featuredPosts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                selectionMode={selectionMode}
                setSelectedPost={setSelectedPost}
                setShowCopyDialog={setShowCopyDialog}
                onExitSelectionMode={onExitSelectionMode}
              />
            ))}
          </div>
          {/* TODO: Implement NewsLetter */}
          {/* <div className="mt-24 p-12 border border-white/10 rounded-3xl bg-white/2 relative backdrop-blur-sm overflow-hidden group/newsletter hover:border-white/20 transition-all duration-500">
            <div
              className="absolute inset-0 opacity-0 group-hover/newsletter:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)",
              }}
            ></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h3
                  className="text-white mb-2"
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    letterSpacing: "-0.02em",
                    fontWeight: "300",
                  }}
                >
                  Stay Updated
                </h3>
                <p className="text-white/40 group-hover/newsletter:text-white/60 transition-colors duration-500">
                  Get notified when I publish new articles
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full sm:w-auto px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all min-w-[250px]"
                />
                <CreativeButton>Subscribe</CreativeButton>
              </div>
            </div>
          </div> */}

          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => router.push("/posts")}
              className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 font-mono tracking-widest transition-colors group"
            >
              View Full Archive
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </motion.section>
    </>
  );
}
