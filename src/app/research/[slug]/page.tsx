import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Article, ArticleFrame } from "@/components/article/Article";
import { articleMetadata } from "@/components/article/metadata";
import { PageTransition } from "@/components/navigation/PageTransition";
import { adjacentResearch, relatedResearch } from "@/components/article/related";
import { getAllResearch, getResearch } from "@/lib/content/research";

type Params = PageProps<"/research/[slug]">["params"];

export async function generateStaticParams() {
  return (await getAllResearch()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const research = await getResearch(slug);
  if (!research) notFound();
  return articleMetadata(research);
}

async function ResearchArticle({ params }: { params: Params }) {
  const { slug } = await params;
  const research = await getResearch(slug);
  if (!research) notFound();

  const all = await getAllResearch();
  const { source, ...meta } = research;

  return (
    <Article
      research={meta}
      source={source}
      related={relatedResearch(meta, all)}
      {...adjacentResearch(meta, all)}
    />
  );
}

/**
 * Every known slug prerenders in full. The boundary keeps the URL read out of
 * the route's shared App Shell (the frame), so client navigations paint at
 * once and the article streams in from its static render.
 */
export default function ResearchArticlePage({ params }: PageProps<"/research/[slug]">) {
  return (
    <PageTransition>
      <ArticleFrame>
        <Suspense>
          <ResearchArticle params={params} />
        </Suspense>
      </ArticleFrame>
    </PageTransition>
  );
}
