"use client";

import { Link } from "@/components/navigation/Link";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/lib/site";
import { useScrollLock } from "@/components/motion/useScrollLock";
import styles from "./MobileMenu.module.css";

type Props = {
  activeIndex: number;
  onSearch: () => void;
};

/** Phone navigation: a native modal dialog (focus containment, Escape, inert page). */
export function MobileMenu({ activeIndex, onSearch }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useScrollLock(isOpen);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        Menu
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        data-tone="ink"
        data-lenis-prevent
        aria-label="Site navigation"
        onClose={close}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <span className={styles.wordmark} translate="no">
              {site.name}
            </span>
            <button type="button" className={styles.close} onClick={close}>
              Close
            </button>
          </div>

          <nav aria-label="Primary">
            <ul role="list" className={styles.list}>
              {navigation.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.link}
                    aria-current={index === activeIndex ? "page" : undefined}
                    onNavigate={close}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    close();
                    onSearch();
                  }}
                >
                  Search
                </button>
              </li>
            </ul>
          </nav>

          <a className={styles.contact} href={`mailto:${site.author.email}`}>
            {site.author.email}
          </a>
        </div>
      </dialog>
    </>
  );
}
