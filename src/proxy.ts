import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /*
   * On exclut les chemins qui ne doivent jamais être préfixés par une langue :
   * les fichiers internes de Next, les routes d'API, les fichiers SEO servis à la
   * racine (robots.txt, sitemap.xml, favicon, icônes, visuel de partage) et plus
   * généralement tout chemin comportant un point, donc tout fichier statique.
   */
  matcher: "/((?!api|trpc|display(?:/|$)|vtc(?:-driver)?(?:/|$)|_next|_vercel|.*\\..*).*)",
};
