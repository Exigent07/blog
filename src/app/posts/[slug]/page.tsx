import { getPostBySlug, getAllPosts, getSimilarPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ClientPageWrapper from "./ClientPageWrapper";
import { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(decodeURIComponent(slug));

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const ogImage = "/og-image.png";
  const publishedTime = new Date(post.date).toISOString();

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    keywords: post.tags,
    authors: [{ name: "Exigent07" }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: "article",
      publishedTime,
      url: `https://exigent07.com/posts/${post.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: [ogImage],
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
    "@type": "TechArticle",
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: ["https://exigent07.com/og-image.png"],
    datePublished: new Date(post.date).toISOString(),
    author: {
      "@type": "Person",
      name: "Exigent07",
      url: "https://exigent07.com",
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://exigent07.com/posts/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ClientPageWrapper post={post} similarPosts={similarPosts} />
    </>
  );
}
