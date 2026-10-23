import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { HomeLogoLink } from "./HomeLogoLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { LaunchOffer } from "./LaunchOffer";

const NAV_HASHES = ["espaces", "solutions", "references", "acces"] as const;

export function Header() {
  const t = useTranslations("nav");

  return (
    <>
      <LaunchOffer />
      <header className="sticky top-0 z-50 w-full border-b border-welcome-line bg-welcome-header">
        <div className="mx-auto flex h-[90px] max-w-[1400px] items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* `Link` de next-intl : conserve la langue courante dans l'URL. */}
          <HomeLogoLink label={t("homeLabel")} />

          <nav className="hidden items-center gap-7 lg:flex xl:gap-10">
            {NAV_HASHES.map((hash) => (
              <Link
                key={hash}
                href={`/#${hash}`}
                className="font-manrope text-[16px] font-semibold text-welcome-black transition-opacity duration-200 hover:opacity-60"
              >
                {t(hash)}
              </Link>
            ))}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-manrope text-[16px] font-semibold text-welcome-black transition-opacity duration-200 hover:opacity-60"
            >
              <Gift
                className="h-[18px] w-[18px] text-[#a51d2d] dark:text-[#d86772]"
                aria-hidden="true"
              />
              {t("shop")}
            </Link>
            <Link
              href="/contact"
              className="font-manrope text-[16px] font-semibold text-welcome-black transition-opacity duration-200 hover:opacity-60"
            >
              {t("contact")}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/shop"
              aria-label={t("shop")}
              className="inline-flex h-10 items-center justify-center gap-1.5 px-1 font-manrope text-sm font-semibold text-welcome-black transition-opacity hover:opacity-60 lg:hidden"
            >
              <Gift
                className="h-[18px] w-[18px] text-[#a51d2d] dark:text-[#d86772]"
                aria-hidden="true"
              />
              {t("shop")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden h-[48px] items-center justify-center rounded-[12px] bg-welcome-gold px-4 font-manrope text-[15px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg md:inline-flex md:px-6 md:text-[16px] lg:hidden xl:inline-flex"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
