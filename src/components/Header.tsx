import { useTranslations } from "next-intl";
import { Snowflake } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { HomeLogoLink } from "./HomeLogoLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { LaunchOffer } from "./LaunchOffer";

const NAV_HASHES = ["espaces", "solutions", "references", "acces"] as const;

function ChristmasShopLabel({ label }: { label: string }) {
  return (
    <>
      <Snowflake className="h-4 w-4 shrink-0 text-[#ffe9a8]" aria-hidden="true" />
      <span className="relative z-10">{label}</span>
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffe9a8] shadow-[0_0_8px_rgba(255,233,168,0.9)]"
        aria-hidden="true"
      />
    </>
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
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#e8c865] bg-[linear-gradient(115deg,#a51d2d_0%,#8e1827_48%,#155f43_52%,#0b4934_100%)] px-4 py-2 font-manrope text-[15px] font-semibold text-white shadow-[0_9px_24px_-12px_rgba(127,25,39,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_13px_28px_-12px_rgba(15,91,65,0.85)]"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60"
                aria-hidden="true"
              />
              <ChristmasShopLabel label={t("shop")} />
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
              className="relative inline-flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#e8c865] bg-[linear-gradient(115deg,#a51d2d_0%,#8e1827_48%,#155f43_52%,#0b4934_100%)] px-3 font-manrope text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(127,25,39,0.9)] transition-all hover:brightness-110 hover:shadow-[0_10px_24px_-12px_rgba(15,91,65,0.85)] lg:hidden"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60"
                aria-hidden="true"
              />
              <ChristmasShopLabel label={t("shop")} />
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
