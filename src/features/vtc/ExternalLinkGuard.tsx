"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./vtc.module.css";

type ExternalPage = { url: string; title: string };

function embeddableUrl(url: URL) {
  if (url.hostname.endsWith("google.com") && url.pathname.startsWith("/maps/")) {
    const query = url.searchParams.get("query");
    if (query) return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  return url.href;
}

export function ExternalLinkGuard() {
  const [page, setPage] = useState<ExternalPage | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const openExternalLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      const forceModal = link.dataset.modal === "true";
      if ((!forceModal && url.origin === window.location.origin) || !/^https?:$/.test(url.protocol))
        return;

      event.preventDefault();
      setPage({ url: embeddableUrl(url), title: link.textContent?.trim() || url.hostname });
    };

    document.addEventListener("click", openExternalLink);
    return () => document.removeEventListener("click", openExternalLink);
  }, []);

  useEffect(() => {
    if (!page) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [page]);

  if (!page) return null;

  return (
    <div
      className={styles.externalModalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setPage(null);
      }}
    >
      <section
        className={styles.externalModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-modal-title"
      >
        <header className={styles.externalModalHeader}>
          <div>
            <strong id="external-modal-title">{page.title}</strong>
            <small>{new URL(page.url).hostname.replace(/^www\./, "")}</small>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setPage(null)}
            aria-label="Fermer"
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <iframe
          className={styles.externalModalFrame}
          src={page.url}
          title={page.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; geolocation; gyroscope; picture-in-picture"
          sandbox="allow-forms allow-same-origin allow-scripts allow-presentation"
        />
      </section>
    </div>
  );
}
