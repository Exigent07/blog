import { getAllPosts } from "@/lib/posts";
import { MetadataRoute } from "next";

const BASE_URL = "https://exigent07.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const routes = [
    "",
    "/about",
    "/posts",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes];
}
