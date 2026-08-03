import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Une langue inconnue dans l'URL retombe sur le français plutôt que de faire
  // échouer le rendu.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  /*
   * Messages répartis en trois fichiers par langue plutôt qu'un seul : la FAQ
   * (21 questions) et les six documents juridiques représentent l'essentiel du
   * volume et évoluent indépendamment de l'interface.
   */
  const [ui, faq, legal] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/faq/${locale}.json`),
    import(`../../messages/legal/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...ui.default, faq: faq.default, legal: legal.default },
  };
});
