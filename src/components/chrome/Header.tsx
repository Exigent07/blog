"use client";

import { Link } from "@/components/navigation/Link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SlashMark } from "@/components/brand/SlashMark";
import { useSearch } from "@/components/search/SearchProvider";
import { navigation } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { SearchIcon } from "./SearchIcon";
import { useHeaderState } from "./useHeaderState";
import { useSurfaceTone } from "./useSurfaceTone";
import styles from "./Header.module.css";

function activeIndexFor(pathname: string) {
  return navigation.findIndex(({ href }) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`),
  );
}

/**
 * Plex Mono advances every glyph by the same width, so each label's centre is
 * known from character counts alone. The marker is positioned in CSS from
 * these counts: no layout reads, correct on the server, animated by a CSS
 * transition when the target changes.
 */
const labelOffsets = navigation.map((_, index) => {
  const before = navigation.slice(0, index).reduce((sum, item) => sum + item.label.length, 0);
  return { chars: before + navigation[index].label.length / 2, gaps: index };
});

export function Header() {
  const pathname = usePathname();
  const state = useHeaderState();
  const tone = useSurfaceTone("top", 40, pathname);
  const { open: openSearch } = useSearch();
  const [preview, setPreview] = useState<number | null>(null);

  const active = activeIndexFor(pathname);
  const target = preview ?? active;
  const offset = target >= 0 ? labelOffsets[target] : undefined;

  return (
    <header
      className={styles.header}
      data-chrome
      data-state={state}
      data-tone={state === "top" ? "paper" : tone}
      data-route={pathname === "/" ? "home" : undefined}
    >
      <div className={styles.inner}>
        <Logo className={styles.logo} />

        <nav className={styles.nav} aria-label="Primary">
          <ul role="list" className={styles.list} onPointerLeave={() => setPreview(null)}>
            {navigation.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={index === active ? "page" : undefined}
                  onPointerEnter={() => setPreview(index)}
                  onFocus={() => setPreview(index)}
                  onBlur={() => setPreview(null)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <span
            className={styles.marker}
            aria-hidden="true"
            data-visible={offset !== undefined}
            style={
              offset && {
                "--marker-chars": offset.chars,
                "--marker-gaps": offset.gaps,
              }
            }
          >
            <SlashMark className={styles.markerSlashes} />
            <span className={styles.markerLine} />
          </span>
        </nav>

        <span className={styles.divider} aria-hidden="true" />

        <button type="button" className={styles.search} onClick={openSearch} aria-keyshortcuts="/ Control+K Meta+K">
          <SearchIcon className={styles.searchIcon} />
          <span className="visually-hidden">Search research</span>
        </button>

        <MobileMenu activeIndex={active} onSearch={openSearch} />
      </div>
      <span className={styles.rule} aria-hidden="true" />
    </header>
  );
}
