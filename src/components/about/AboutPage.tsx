import { Spine } from "@/components/chrome/Spine";
import type { ResearchMeta } from "@/lib/content/research";
import { AboutContact } from "./AboutContact";
import { AboutIntro } from "./AboutIntro";
import { AboutResearch } from "./AboutResearch";
import { DisclosureRecord } from "./DisclosureRecord";
import { ProfileJsonLd } from "./ProfileJsonLd";
import styles from "./AboutPage.module.css";

/**
 * Who the author is, what they write about, the record, how to reach them. One spine
 * runs the page; the ink record draws its own segment over it.
 */
export function AboutPage({ research }: { research: ResearchMeta[] }) {
  return (
    <div className={styles.page}>
      <ProfileJsonLd />
      <Spine label="About" />
      <AboutIntro />
      <AboutResearch research={research} />
      <DisclosureRecord />
      <AboutContact />
    </div>
  );
}
