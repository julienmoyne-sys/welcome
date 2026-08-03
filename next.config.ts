import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Anciennes URL de navigation qui ne correspondent plus à des pages : elles
 * ciblent des sections de l'accueil. Redirection 308 côté serveur pour que les
 * moteurs consolident le signal sur `/` au lieu de découvrir des pages vides.
 */
const SECTION_REDIRECTS = ["acces", "contact", "espaces", "formules", "references"];

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  poweredByHeader: false,
  // Une seule forme d'URL canonique : pas de variante avec slash final.
  trailingSlash: false,

  images: {
    // Les sources sont des PNG/JPEG volumineux importés statiquement ; l'AVIF
    // divise leur poids par plusieurs fois, avec repli WebP puis format d'origine.
    formats: ["image/avif", "image/webp"],
    /*
     * Next 16 rejette en 400 toute qualité non déclarée ici (défaut : `[75]`).
     * 60 est réservé aux photographies plein cadre, dont le visuel d'en-tête : il
     * est en grande partie recouvert par un dégradé, la perte est imperceptible
     * alors que le gain de poids est net.
     */
    qualities: [60, 75],
  },

  async redirects() {
    return SECTION_REDIRECTS.map((section) => ({
      source: `/${section}`,
      destination: `/#${section}`,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
