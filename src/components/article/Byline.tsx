import { Link } from "@/components/navigation/Link";
import { BracketAction } from "@/components/ui/BracketAction";
import { site } from "@/lib/site";
import styles from "./Byline.module.css";

/** The article's signature: who wrote it, under which name, and where to read more about them. */
export function Byline() {
  return (
    <footer className={styles.byline}>
      <div className={styles.author}>
        <p className={styles.label}>Written by</p>
        <p className={styles.name}>
          {site.author.name}
          <span className={styles.handle} translate="no">
            {site.author.handle}
          </span>
        </p>
      </div>
      <Link href="/about" className={styles.about}>
        <BracketAction tail={false}>About the author</BracketAction>
      </Link>
    </footer>
  );
}
