"use client";

import { useEffect } from "react";

const POPUP_FEATURES = "popup=yes,width=1100,height=760,resizable=yes,scrollbars=yes";

export function ExternalLinkGuard() {
  useEffect(() => {
    const openExternalLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin || !/^https?:$/.test(url.protocol)) return;

      event.preventDefault();
      const popup = window.open(url.href, "welcome-vtc-external", POPUP_FEATURES);
      if (popup) {
        popup.opener = null;
        popup.focus();
      }
    };

    document.addEventListener("click", openExternalLink);
    return () => document.removeEventListener("click", openExternalLink);
  }, []);

  return null;
}
