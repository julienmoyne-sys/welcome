import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/routing";
import { OG_DEFAULTS } from "./seo";

/**
 * Chemin public d'une page pour une langue donnée.
 *
 * Le français n'est pas préfixé (`localePrefix: "as-needed"`), les autres le sont.
 */
export function localePath(locale: string, path: string): string {
  const suffix = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return suffix || "/";
  return `/${locale}${suffix}`;
}

/**
 * Métadonnées d'une page, langue comprise.
 *
 * `alternates.languages` produit les balises `hreflang`, indispensables pour qu'un
 * moteur comprenne que les trois URL sont des traductions et non du contenu
 * dupliqué. `x-default` désigne la version servie quand aucune langue ne
 * correspond — ici le français.
 */
export async function buildPageMetadata({
  locale,
  path,
  namespace,
  twitterCard = "summary_large_image",
}: {
  locale: string;
  path: string;
  namespace: string;
  twitterCard?: "summary" | "summary_large_image";
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const canonical = localePath(locale, path);

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(LOCALES.map((code) => [code, localePath(code, path)])),
        "x-default": localePath(DEFAULT_LOCALE, path),
      },
    },
    openGraph: {
      ...OG_DEFAULTS,
      locale: LOCALE_TAGS[locale as Locale],
      alternateLocale: LOCALES.filter((code) => code !== locale).map((code) => LOCALE_TAGS[code]),
      url: canonical,
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: { card: twitterCard },
  };
}
