"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import CopyLinkDialog from "@/components/CopyLinkDialog";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { filterPosts } from "@/utils/searchUtils";
import CreativeButton from "@/components/CreativeButton";
import PageTitle from "@/components/PageTitle";
import { useRouter, useSearchParams } from "next/navigation";
import BlogCard from "./BlogCard";
import { SearchX } from "lucide-react";
import type { PostData } from "@/lib/posts";

type BlogCardPost = PostData & { span?: string };

export function AllPostsPage({
  selectionMode,
  onExitSelectionMode,
  initialPosts = [],
  availableTags = [],
  availableCategories = [],
  availableYears = [],
}: {
  selectionMode: boolean;
  onExitSelectionMode: () => void;
  initialPosts: PostData[];
  availableTags?: string[];
  availableCategories?: string[];
  availableYears?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showCopyDialog, setShowCopyDialog] = useState(false);
  
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  const [searchQuery, setSearchQuery] = useState(() => {
    const query = searchParams.get("q");
    return query ? decodeURIComponent(query) : "";
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(9);

  const posts = initialPosts;

  useEffect(() => {
    const query = searchParams.get("q");
    const newQuery = query ? decodeURIComponent(query) : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(newQuery);
    setCurrentPage(1);
  }, [searchParams]);

  const filteredPosts = filterPosts(posts, searchQuery);

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

  const handleBackClick = () => {
    router.push("/");
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

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
        className="relative py-40 px-4 sm:px-6 lg:px-8 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <PageTitle mainText="All" accentText="Posts" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <CreativeButton icon="left" onClick={handleBackClick}>
                Home
              </CreativeButton>
              <CreativeButton href="/about">About</CreativeButton>
            </motion.div>
          </div>

          <div className="mb-12">
            <SearchBar
              onQueryChange={setSearchQuery}
              placeholder="Search articles, tags, categories..."
              externalQuery={searchQuery}
              availableTags={availableTags}
              availableCategories={availableCategories}
              availableYears={availableYears}
            />
          </div>

          {filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
                {currentPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    post={post as BlogCardPost}
                    selectionMode={selectionMode}
                    setSelectedPost={setSelectedPost} 
                    setShowCopyDialog={setShowCopyDialog}
                    onExitSelectionMode={onExitSelectionMode}
                  />
                ))}
              </div>

              <div className="mt-12">
                <Pagination
                  totalPosts={filteredPosts.length}
                  postsPerPage={postsPerPage}
                  onPostsPerPageChange={setPostsPerPage}
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredPosts.length / postsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-xl border border-white/10 bg-white/2 p-16 text-center flex flex-col items-center justify-center gap-6 min-h-[400px]"
            >
              <div className="p-5 rounded-full bg-white/5 text-white/30 border border-white/5">
                <SearchX size={48} strokeWidth={1.5} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-medium text-white/90">
                  No posts found
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  We couldn&apos;t find any posts matching &quot;{searchQuery}
                  &quot;. Try adjusting your search terms or clearing filters.
                </p>
              </div>
              <CreativeButton
                onClick={() => {
                  setSearchQuery("");
                  router.replace("/posts");
                }}
              >
                Clear Search
              </CreativeButton>
            </motion.div>
          )}
        </div>
      </motion.section>
    </>
  );
}
