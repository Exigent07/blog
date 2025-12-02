import { getPostBySlug, getAllPosts, getSimilarPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ClientPageWrapper from "./ClientPageWrapper";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/components/LoadingScreen";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: ["/og-image.png"],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));

  if (!post) {
    notFound();
  }

  const similarPosts = getSimilarPosts(post.slug, post.tags, post.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Exigent07",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={<Loading />}>
        <ClientPageWrapper post={post} similarPosts={similarPosts} />
      </Suspense>
    </>
  );
}
