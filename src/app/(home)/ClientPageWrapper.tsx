"use client";

import BlogPosts from "@/components/BlogPosts";
import { useUI } from "@/contexts/UIContext";
import type { PostData } from "@/lib/posts";

export default function ClientPageWrapper({ posts }: { posts: PostData[] }) {
  const { selectionMode, setSelectionMode } = useUI();
  
  return (
    <BlogPosts
      posts={posts}
      selectionMode={selectionMode}
      onExitSelectionMode={() => setSelectionMode(false)}
    />
  );
}
