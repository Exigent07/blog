"use client";

import { AllPostsPage } from "@/components/PostsPage";
import { useUI } from "@/contexts/UIContext";
import type { PostData } from "@/lib/posts";

export default function ClientPageWrapper({ 
  posts,
  availableTags,
  availableCategories,
  availableYears
}: { 
  posts: PostData[];
  availableTags: string[];
  availableCategories: string[];
  availableYears: string[];
}) {
  const { selectionMode, setSelectionMode } = useUI();
  
  return (
    <AllPostsPage
      initialPosts={posts}
      selectionMode={selectionMode}
      onExitSelectionMode={() => setSelectionMode(false)}
      availableTags={availableTags}
      availableCategories={availableCategories}
      availableYears={availableYears}
    />
  );
}
