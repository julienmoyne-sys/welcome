import { defineRouting } from "next-intl/routing";

export const LOCALES = ["fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Étiquettes du sélecteur de langue, chacune dans sa propre langue. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

/** Codes de langue complets, pour `og:locale` et l'attribut `lang`. */
export const LOCALE_TAGS: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_GB",
  de: "de_DE",
};

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  /*
   * `as-needed` : le français reste servi à la racine (`/`, `/faq`, …) et seules
   * les autres langues sont préfixées (`/en/faq`, `/de/faq`).
   *
   * Ce choix est dicté par le SEO : les URL françaises sont déjà celles du
   * sitemap, des canoniques et des liens entrants. Les préfixer en `/fr/`
   * imposerait des redirections sur l'intégralité du site.
   */
  localePrefix: "as-needed",
});
