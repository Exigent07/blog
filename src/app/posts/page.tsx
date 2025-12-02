import { getAllPosts, getUniqueTags, getUniqueCategories, getUniqueYears } from "@/lib/posts";
import ClientPageWrapper from "./ClientPageWrapper";
import { Suspense } from "react";
import Loading from "@/components/LoadingScreen";

export const metadata = {
  title: "All Posts | Exigent07",
  description: "Browse all security research articles and CTF writeups.",
};

export default function Page() {
  const posts = getAllPosts();
  
  const tags = getUniqueTags();
  const categories = getUniqueCategories();
  const years = getUniqueYears();

  return (
    <Suspense fallback={<Loading />}>
      <ClientPageWrapper 
        posts={posts} 
        availableTags={tags}
        availableCategories={categories}
        availableYears={years}
      />
    </Suspense>
  );
}
