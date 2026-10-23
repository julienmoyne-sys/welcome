import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { HomeLogoLink } from "./HomeLogoLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { LaunchOffer } from "./LaunchOffer";

const NAV_HASHES = ["espaces", "solutions", "references", "acces"] as const;

function ChristmasGiftBow() {
  return (
    <span className="relative z-10 h-5 w-7 shrink-0" aria-hidden="true">
      <span className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-[-18deg] rounded-[70%_35%_65%_35%] border border-[#d7aa4f] bg-[#9f1d2b] shadow-sm" />
      <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-[18deg] rounded-[35%_70%_35%_65%] border border-[#d7aa4f] bg-[#9f1d2b] shadow-sm" />
      <span className="absolute bottom-0 left-[7px] h-2.5 w-1.5 rotate-[20deg] rounded-b-sm bg-[#8b1724]" />
      <span className="absolute bottom-0 right-[7px] h-2.5 w-1.5 rotate-[-20deg] rounded-b-sm bg-[#8b1724]" />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-[#e1b85f] bg-[#871420] shadow-sm" />
    </span>
  );
}

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
              className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[#c99a3f] bg-[linear-gradient(110deg,#f6dfa0_0%,#d8b25c_52%,#f2d68a_100%)] px-4 py-2 font-manrope text-[15px] font-semibold text-[#173529] shadow-[inset_0_-3px_0_#8f1624,0_9px_24px_-14px_rgba(117,72,15,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[inset_0_-3px_0_#8f1624,0_13px_28px_-14px_rgba(117,72,15,0.75)]"
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-[27px] w-1.5 bg-[#921824]/90"
                aria-hidden="true"
              />
              <ChristmasGiftBow />
              <span className="relative z-10">{t("shop")}</span>
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
              className="relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full border border-[#c99a3f] bg-[linear-gradient(110deg,#f6dfa0_0%,#d8b25c_52%,#f2d68a_100%)] px-3 font-manrope text-sm font-semibold text-[#173529] shadow-[inset_0_-3px_0_#8f1624,0_8px_20px_-13px_rgba(117,72,15,0.8)] transition-all hover:brightness-105 hover:shadow-[inset_0_-3px_0_#8f1624,0_10px_24px_-13px_rgba(117,72,15,0.75)] lg:hidden"
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-[23px] w-1.5 bg-[#921824]/90"
                aria-hidden="true"
              />
              <ChristmasGiftBow />
              <span className="relative z-10">{t("shop")}</span>
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
