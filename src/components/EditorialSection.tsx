import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import editorialImage from "../assets/editorial-welcome.jpg";

export function EditorialSection() {
  const t = useTranslations("editorial");
  const benefits = t.raw("benefits") as { title: string; text: string }[];

  return (
    <section className="bg-welcome-cream py-24 sm:py-28 lg:py-[120px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Image column — 48% on desktop */}
          <div className="w-full lg:w-[48%]">
            <div className="overflow-hidden rounded-[20px]">
              {/* Dimensions intrinsèques fournies par l'import statique. */}
              <Image
                src={editorialImage}
                alt={t("imageAlt")}
                className="welcome-photo h-[420px] w-full object-cover sm:h-[520px] lg:h-[620px]"
                /*
                 * Largeur réelle du créneau, et non `100vw` / `48vw` : le conteneur
                 * est plafonné à 1280 px et porte 24 px (48 px en lg) de padding
                 * horizontal. Surdéclarer fait franchir un palier de `deviceSizes`
                 * et télécharger une variante inutilement large.
                 *   ≥ 1280 : 48 % de (1280 − 80) = 576 px
                 *   ≥ 1024 : 48 % de (100vw − 80)
                 *   sinon  : 100vw − 48
                 */
                sizes="(min-width: 1280px) 576px, (min-width: 1024px) 47vw, calc(100vw - 48px)"
              />
            </div>
          </div>

          {/* Text column — 52% on desktop */}
          <div className="w-full lg:w-[52%]">
            <p className="font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 font-manrope text-[36px] font-bold leading-[1.12] tracking-tight text-welcome-black sm:text-[42px] lg:text-[48px] xl:text-[56px]">
              {t("titleLine1")}
              <br />
              <span className="text-welcome-gold">{t("titleLine2")}</span>
            </h2>
            <p className="mt-6 max-w-xl font-inter text-lg leading-[1.7] text-welcome-body">
              {t("lead")}
            </p>

            {/* Benefits grid */}
            <div className="mt-10 grid grid-cols-1 gap-8 border-t border-welcome-black/10 pt-10 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title}>
                  <h3 className="font-manrope text-[17px] font-semibold text-welcome-black">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 font-inter text-[15px] leading-[1.6] text-welcome-body/80">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/#espaces"
                className="inline-flex items-center justify-center rounded-[12px] border border-welcome-black/20 bg-transparent px-[26px] py-[15px] font-manrope text-[16px] font-semibold text-welcome-black transition-all duration-200 hover:bg-welcome-black hover:text-welcome-ink-fg"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
