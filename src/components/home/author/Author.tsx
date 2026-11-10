import { Link } from "@/components/navigation/Link";
import { Spine } from "@/components/chrome/Spine";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Author.module.css";

/**
 * The person behind the publication, in the author's own voice. Every fact here comes
 * from the author's published profile or articles; highlighted runs mark the facts
 * a scanning reader looks for.
 */
export function Author() {
  return (
    <section className={styles.section} data-tone="paper" aria-labelledby="author-title">
      <Spine label="Author" />
      <Reveal>
        <div className={styles.layout}>
          <h2 id="author-title" className={styles.name} data-reveal="lines">
            Aravindh
          </h2>
          <p className={styles.handles} data-reveal="block">
            <span translate="no">exigent07</span>
            <span translate="no">ex1g3n7</span>
          </p>
          <div className={styles.story} data-reveal="block">
            <p>
              I&rsquo;m <mark>Aravindh</mark>, and exigent07 is where I publish what I find. I read the rendering layers of
              web and AI products until two of them disagree about the same string. Three of my reports on Gemini to{" "}
              <mark>Google&rsquo;s Vulnerability Reward Program</mark> were rewarded, <mark>up to $15,000</mark>, and{" "}
              <mark>ten of my reports have been accepted</mark> across four programs. I found the first piece of the
              Tailwind-merge finding in my <mark>second year of college</mark> and only understood its impact later. I
              play CTFs, hunt bugs on HackerOne and Bugcrowd, and when I get bored of security, I do{" "}
              <mark>web development</mark>.
            </p>
            <p className={styles.closing}>
              <Link href="/about" className={styles.more}>
                The full record, profiles and how to reach&nbsp;me
              </Link>
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
