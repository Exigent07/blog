import { getAllPosts, getUniqueTags, getUniqueCategories, getUniqueYears } from "@/lib/posts";
import ClientPageWrapper from "./ClientPageWrapper"

export default function Page() {
  const posts = getAllPosts();
  
  const tags = getUniqueTags();
  const categories = getUniqueCategories();
  const years = getUniqueYears();

  return (
    <ClientPageWrapper 
      posts={posts} 
      availableTags={tags}
      availableCategories={categories}
      availableYears={years}
    />
  );
}
