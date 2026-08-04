import type { MetadataRoute } from "next";

import { LOCALES } from "@/i18n/routing";
import { localePath } from "@/lib/metadata";
import { SITE_URL } from "@/lib/seo";

/**
 * Les routes `/acces`, `/contact`, `/espaces`, `/formules` et `/references`
 * n'apparaissent pas ici : ce sont des redirections 308 vers des sections de
 * l'accueil (voir `next.config.ts`), pas des URL indexables.
 */
const PAGES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/comparatif-solutions", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/open-space", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/bureaux-privatifs", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/salle-de-reunion", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/cuisine-detente", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/mentions-legales", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/conditions-generales-d-utilisation", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/politique-de-confidentialite", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/politique-de-cookies", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/gestion-des-cookies", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/declaration-d-accessibilite", changeFrequency: "yearly" as const, priority: 0.3 },
];

/**
 * Une entrée par page et par langue, chacune portant `alternates.languages`.
 *
 * Déclarer les traductions dans le sitemap double le signal `hreflang` déjà présent
 * dans le `<head>` : Google recommande explicitement l'un ou l'autre, et les deux
 * ensemble lèvent toute ambiguïté sur le fait que ces URL sont des traductions et
 * non du contenu dupliqué.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, page.path)}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((code) => [code, `${SITE_URL}${localePath(code, page.path)}`]),
        ),
      },
    })),
  );
}
