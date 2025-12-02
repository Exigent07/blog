"use client";

import { useUI } from "@/contexts/UIContext";
import { BlogReadPage } from "@/components/BlogReadPage";
import { useRouter } from "next/navigation";
import type { PostData } from "@/lib/posts";

export default function ClientPageWrapper({ 
  post, 
  similarPosts 
}: { 
  post: PostData; 
  similarPosts: PostData[]; 
}) {
  const { readingMode, setReadingMode } = useUI();
  const router = useRouter();

  return (
    <BlogReadPage
      post={post}
      similarPosts={similarPosts}
      onBack={() => router.back()}
      readingMode={readingMode}
      onReadingModeChange={setReadingMode}
    />
  );
}
