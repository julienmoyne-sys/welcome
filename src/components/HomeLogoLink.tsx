"use client";

import type { MouseEvent } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { WelcomeLogo } from "./WelcomeLogo";

export function HomeLogoLink({ label }: { label: string }) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      pathname !== "/" ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Link href="/" className="shrink-0" aria-label={label} onClick={handleClick}>
      <WelcomeLogo className="w-[210px]" />
    </Link>
  );
}
