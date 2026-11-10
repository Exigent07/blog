import { Spine } from "@/components/chrome/Spine";
import type { ResearchMeta } from "@/lib/content/research";
import { TOPICS } from "@/lib/content/schema";
import { ArticleBody } from "./ArticleBody";
import { ArticleHeader } from "./ArticleHeader";
import { Byline } from "./Byline";
import { articleStructuredData } from "./metadata";
import { MoreResearch } from "./MoreResearch";
import styles from "./Article.module.css";

/**
 * The page frame, identical for every article, so it belongs to the route's
 * App Shell and stays in place (with its tone) while an article streams in.
 */
export function ArticleFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page} data-tone="paper">
      {children}
    </div>
  );
}

type Props = {
  research: ResearchMeta;
  /** The complete file, frontmatter included, for the compiled body. */
  source: string;
  related: ResearchMeta[];
  older?: ResearchMeta;
  newer?: ResearchMeta;
};

/**
 * One research article: header, contents and prose, byline, then related
 * and adjacent research. Ids derive from the slug: Next keeps recently
 * visited routes mounted (hidden), so ids must stay unique across articles.
 */
export function Article({ research, source, related, older, newer }: Props) {
  const titleId = `${research.slug}-title`;
  const structuredData = JSON.stringify(articleStructuredData(research)).replace(/</g, "\\u003c");

  return (
    <>
      <Spine label={TOPICS[research.topic]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <article className={styles.article} aria-labelledby={titleId}>
        <ArticleHeader research={research} titleId={titleId} />
        <ArticleBody
          source={source}
          format={research.format}
          path={`content/research/${research.slug}.${research.format}`}
        />
        <Byline />
      </article>

      <MoreResearch slug={research.slug} related={related} older={older} newer={newer} />
    </>
  );
}
