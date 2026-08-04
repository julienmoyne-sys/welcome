import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { HomeLogoLink } from "./HomeLogoLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const NAV_HASHES = ["espaces", "solutions", "references", "acces", "contact"] as const;

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-welcome-line bg-welcome-header">
      <div className="mx-auto flex h-[90px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
        {/* `Link` de next-intl : conserve la langue courante dans l'URL. */}
        <HomeLogoLink label={t("homeLabel")} />

        <nav className="hidden items-center gap-10 lg:flex lg:gap-14">
          {NAV_HASHES.map((hash) => (
            <Link
              key={hash}
              href={`/#${hash}`}
              className="font-manrope text-[16px] font-semibold text-welcome-black transition-opacity duration-200 hover:opacity-60"
            >
              {t(hash)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/#contact"
            className="hidden h-[48px] items-center justify-center rounded-[12px] bg-welcome-gold px-4 font-manrope text-[15px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg md:inline-flex md:px-6 md:text-[16px]"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
