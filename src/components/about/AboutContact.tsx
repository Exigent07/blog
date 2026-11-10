import { SlashMark } from "@/components/brand/SlashMark";
import { Reveal } from "@/components/motion/Reveal";
import { type Profile, researchProfiles, site, socialProfiles } from "@/lib/site";
import { CopyHandle } from "./CopyHandle";
import { DISCORD_HANDLE } from "./facts";
import styles from "./AboutContact.module.css";

function ProfileGroup({ title, profiles }: { title: string; profiles: readonly Profile[] }) {
  return (
    <div className={styles.group} data-reveal="block">
      <h3 className={styles.label}>{title}</h3>
      <ul role="list" className={styles.profiles}>
        {profiles.map((profile) => (
          <li key={profile.href}>
            <a className={styles.profile} href={profile.href} rel="me noreferrer">
              <span className={styles.marker} aria-hidden="true">
                <SlashMark className={styles.slashes} />
              </span>
              <span className={styles.platform} translate="no">
                {profile.label}
              </span>
              <span className={styles.handle} translate="no">
                {profile.handle}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Email is the action, set to the full measure; on hover or focus the ink
 * territory sweeps across it at the boundary angle. Discord, which has no
 * public profile URL, offers its handle to copy; the profiles follow.
 */
export function AboutContact() {
  return (
    <section className={styles.section} data-tone="paper" aria-labelledby="about-contact-title">
      <Reveal>
        <h2 id="about-contact-title" className={styles.heading} data-reveal="lines">
          Contact
        </h2>

        <a className={styles.email} href={`mailto:${site.author.email}`} translate="no" data-reveal="block">
          {site.author.email}
          <span className={styles.emailInk} aria-hidden="true">
            {site.author.email}
          </span>
        </a>

        <div className={styles.channels} data-reveal-group>
          <div className={styles.group} data-reveal="block">
            <h3 className={styles.label}>Discord</h3>
            <CopyHandle handle={DISCORD_HANDLE} service="Discord" />
          </div>
          <ProfileGroup title="Research platforms" profiles={researchProfiles} />
          <ProfileGroup title="Elsewhere" profiles={socialProfiles} />
        </div>
      </Reveal>
    </section>
  );
}
