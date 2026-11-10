import { cacheLife } from "next/cache";
import { compileResearch } from "@/lib/content/markdown";
import type { ResearchFormat } from "@/lib/content/research";
import { mdxComponents } from "./mdx-components";
import { TableOfContents } from "./TableOfContents";
import styles from "./ArticleBody.module.css";
import prose from "./Prose.module.css";

type Props = {
  /** The complete file; as part of the cache key, any edit recompiles the article. */
  source: string;
  format: ResearchFormat;
  /** Reported in compile errors. */
  path: string;
};

/**
 * The compiled article: its contents and its prose, as two items of the
 * article grid. Compiling MDX, highlighting and probing media is the
 * expensive part of the page, so it is cached for good and becomes part of
 * the static shell.
 */
export async function ArticleBody({ source, format, path }: Props) {
  "use cache";
  cacheLife("max");

  const { Content, toc } = await compileResearch(source, format, path);

  return (
    <>
      {toc.length > 0 && (
        // The rail spans the header and body rows only, so the sticky contents release before the byline.
        <div className={styles.rail}>
          <TableOfContents entries={toc} />
        </div>
      )}
      <div className={`${styles.body} ${prose.prose}`}>
        <Content components={mdxComponents} />
      </div>
    </>
  );
}
