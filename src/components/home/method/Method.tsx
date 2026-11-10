import { Link } from "@/components/navigation/Link";
import type { Route } from "next";
import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import type { ResearchMeta } from "@/lib/content/research";
import { Tokenizer } from "./Tokenizer";
import styles from "./Method.module.css";

/**
 * The method, told only in the author's own words from the write-ups. Each
 * quote names its source by slug; the page fails to build if a source article
 * disappears, so a quote can never outlive its article.
 */
const THESIS = {
  quote: "Sometimes the attack isn’t in one library. It’s in the assumptions made between libraries.",
  source: "when-language-becomes-layout",
};

const MOVES = [
  {
    move: "Notice what renders oddly.",
    quote: "An old ChatGPT PoC I had was acting weird – the code blocks kept breaking in unexpected ways.",
    source: "the-bug-that-cost-google-gemini",
  },
  {
    move: "Trace every layer.",
    quote:
      "Instead of blindly fuzzing more, I switched gears and opened up the browser debugger to see what was actually happening under the hood.",
    source: "the-bug-that-cost-google-gemini",
  },
  {
    move: "Ask a better question.",
    quote: "The more useful question was: what can I do with classes the app has already generated?",
    source: "when-language-becomes-layout",
  },
  {
    move: "Show the real impact.",
    quote:
      "…even without JavaScript execution, HTML injection in trusted contexts can enable sophisticated credential theft and phishing attacks.",
    source: "credential-leak-in-gemini",
  },
] as const;

function Source({ slug, research }: { slug: string; research: ResearchMeta[] }) {
  const entry = research.find((item) => item.slug === slug);
  if (!entry) throw new Error(`Method section quotes a missing article: "${slug}"`);
  return (
    <Link className={styles.source} href={`/research/${slug}` as Route}>
      {entry.title}
    </Link>
  );
}

export function Method({ research }: { research: ResearchMeta[] }) {
  return (
    <section className={styles.section} data-tone="paper" aria-labelledby="method-title">
      <Spine label="Method" />
      <Reveal>
        <div className={styles.intro}>
          <h2 id="method-title" className={styles.heading} data-reveal="lines">
            Between the libraries
          </h2>
          <figure className={styles.thesis} data-reveal="block">
            <blockquote className={styles.thesisQuote}>
              <p>{THESIS.quote}</p>
            </blockquote>
            <figcaption className={styles.caption}>
              <Source slug={THESIS.source} research={research} />
            </figcaption>
          </figure>
        </div>

        <ul role="list" className={styles.moves} data-reveal-group>
          {MOVES.map((item) => (
            <li key={item.move} className={styles.move} data-reveal="block">
              <h3 className={styles.moveTitle}>{item.move}</h3>
              <figure className={styles.moveFigure}>
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className={styles.caption}>
                  <Source slug={item.source} research={research} />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div data-reveal="block">
          <Tokenizer />
        </div>
      </Reveal>
    </section>
  );
}
