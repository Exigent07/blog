import { getAllPosts } from "@/lib/posts";
import ClientPageWrapper from "./ClientPageWrapper"

export default function Page() {
  const posts = getAllPosts();

  return <ClientPageWrapper posts={posts} />;
}
