import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Les routes `/acces`, `/contact`, `/espaces`, `/formules` et `/references`
 * n'apparaissent pas ici : ce sont des redirections 308 vers des sections de
 * l'accueil (voir `next.config.ts`), pas des URL indexables.
 */
const ROUTES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "weekly", priority: 1 },
  { url: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { url: "/mentions-legales", changeFrequency: "yearly", priority: 0.3 },
  { url: "/conditions-generales-d-utilisation", changeFrequency: "yearly", priority: 0.3 },
  { url: "/politique-de-confidentialite", changeFrequency: "yearly", priority: 0.3 },
  { url: "/politique-de-cookies", changeFrequency: "yearly", priority: 0.3 },
  { url: "/gestion-des-cookies", changeFrequency: "yearly", priority: 0.3 },
  { url: "/declaration-d-accessibilite", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ ...route, url: `${SITE_URL}${route.url}` }));
}
