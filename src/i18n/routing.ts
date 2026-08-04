import { defineRouting } from "next-intl/routing";

export const LOCALES = ["fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Étiquettes du sélecteur de langue, chacune dans sa propre langue. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  de: "DE",
};

/**
 * Drapeaux du sélecteur de langue.
 *
 * Des emoji et non des SVG : un `<option>` d'un `<select>` natif ne peut contenir
 * que du texte. Le drapeau anglais est celui du Royaume-Uni, cohérent avec le tag
 * `en_GB` ci-dessous.
 *
 * Windows ne possède pas de glyphes de drapeau dans ses polices emoji : le couple
 * de lettres du code pays s'affiche à la place (« FR », « GB », « DE »). C'est la
 * raison pour laquelle le libellé textuel est conservé à côté — le sélecteur reste
 * parfaitement lisible dans ce cas.
 */
export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  de: "🇩🇪",
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
