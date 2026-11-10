"use client";

import { useSearch } from "@/components/search/SearchProvider";
import styles from "./Footer.module.css";

export function FooterSearch() {
  const { open } = useSearch();
  return (
    <button type="button" className={styles.link} onClick={open}>
      Search
    </button>
  );
}
