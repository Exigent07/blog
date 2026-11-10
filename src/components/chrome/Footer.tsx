import { Link } from "@/components/navigation/Link";
import { getAllResearch } from "@/lib/content/research";
import { formatYearSpan } from "@/lib/format";
import { navigation, researchProfiles, site, socialProfiles } from "@/lib/site";
import { BackToTop } from "./BackToTop";
import { FooterFrame } from "./FooterFrame";
import { FooterMark } from "./FooterMark";
import { FooterSearch } from "./FooterSearch";
import styles from "./Footer.module.css";

export async function Footer() {
  // Years the publication spans, from its own articles (never the clock).
  const range = formatYearSpan((await getAllResearch()).map((entry) => entry.publishedAt));

  return (
    <FooterFrame className={styles.footer}>
      <div className={styles.columns}>
        <nav className={styles.column} aria-labelledby="footer-navigate">
          <h2 id="footer-navigate" className={styles.heading}>
            Navigate
          </h2>
          <ul role="list" className={styles.list}>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className={styles.link} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <FooterSearch />
            </li>
            <li>
              <a className={styles.link} href="/feed.xml">
                RSS feed
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 id="footer-programs" className={styles.heading}>
            Research profiles
          </h2>
          <ul role="list" className={styles.list}>
            {researchProfiles.map((profile) => (
              <li key={profile.href}>
                <a className={styles.link} href={profile.href} rel="me noreferrer">
                  {profile.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <h2 id="footer-elsewhere" className={styles.heading}>
            Elsewhere
          </h2>
          <ul role="list" className={styles.list}>
            {socialProfiles.map((profile) => (
              <li key={profile.href}>
                <a className={styles.link} href={profile.href} rel="me noreferrer">
                  {profile.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.column} ${styles.contact}`}>
          <h2 id="footer-contact" className={styles.heading}>
            Contact
          </h2>
          <a className={styles.email} href={`mailto:${site.author.email}`}>
            {site.author.email}
          </a>
        </div>
      </div>

      <FooterMark />

      <div className={styles.legal}>
        <p>
          Independent security research by {site.author.name}.{range && ` Published ${range}.`}
        </p>
        <BackToTop />
      </div>
    </FooterFrame>
  );
}
