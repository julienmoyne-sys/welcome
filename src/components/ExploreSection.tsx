import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import privateOfficesImage from "../assets/bureaux-privatifs.jpg";
import kitchenLoungeImage from "../assets/cuisine-detente.jpg";
import openSpaceImage from "../assets/open-space.jpg";
import meetingRoomImage from "../assets/salle-reunion.jpg";

/*
 * Largeur réelle d'une carte, gouttières et padding déduits — surdéclarer ferait
 * franchir un palier de `deviceSizes` pour rien. Conteneur plafonné à 1280 px,
 * padding 24 px (48 px en lg), grille `gap-8` (32 px) :
 *   ≥ 1280 : (1200 − 3 × 32) / 4 = 276 px
 *   ≥ 1024 : 4 colonnes    → ~23vw
 *   ≥ 640  : 2 colonnes    → ~48vw
 *   sinon  : 1 colonne     → 100vw − 48
 */
const CARD_SIZES =
  "(min-width: 1280px) 276px, (min-width: 1024px) 23vw, (min-width: 640px) 48vw, calc(100vw - 48px)";

/** Clé de traduction ↔ visuel. L'ordre du tableau est l'ordre d'affichage. */
const CARDS = [
  { key: "openSpace", image: openSpaceImage, href: "/open-space" },
  { key: "privateOffices", image: privateOfficesImage, href: "/bureaux-privatifs" },
  { key: "meetingRoom", image: meetingRoomImage, href: "/salle-de-reunion" },
  { key: "kitchenLounge", image: kitchenLoungeImage, href: "/cuisine-detente" },
] as const;

export function ExploreSection() {
  const t = useTranslations("explore");

  return (
    <section className="bg-welcome-white py-24 sm:py-28 lg:py-[120px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            id="espaces"
            className="scroll-mt-[120px] font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage"
          >
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-manrope text-[36px] font-bold leading-[1.12] tracking-tight text-welcome-black sm:text-[42px] lg:text-[48px] xl:text-[56px]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")} <span className="text-welcome-gold">{t("titleHighlight")}</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-inter text-lg leading-[1.7] text-welcome-body">
            {t("lead")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <article
              key={card.key}
              className="group flex flex-col overflow-hidden rounded-[20px] bg-welcome-white shadow-[0_8px_40px_-12px_rgba(11,11,11,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_48px_-12px_rgba(11,11,11,0.12)]"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* `fill` : le conteneur impose le ratio 4/5, l'image le remplit. */}
                <Image
                  src={card.image}
                  alt={t(`cards.${card.key}.alt`)}
                  fill
                  sizes={CARD_SIZES}
                  className="welcome-photo object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-manrope text-[22px] font-semibold leading-tight text-welcome-black">
                  {t(`cards.${card.key}.title`)}
                </h3>
                <p className="mt-2 flex-1 font-inter text-[15px] leading-[1.6] text-welcome-body/80">
                  {t(`cards.${card.key}.text`)}
                </p>
                <div className="mt-6">
                  <Link
                    href={card.href}
                    className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-welcome-black px-5 font-manrope text-[14px] font-semibold text-welcome-ink-fg transition-all duration-200 hover:bg-welcome-black/85"
                  >
                    {t("cta")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
