export const SITE_URL = "https://www.welcome-coworking.com";

export const SITE_NAME = "Welcome Coworking";
export const SITE_LEGAL_NAME = "BUZZ CAPITAL";
export const SITE_EMAIL = "contact@welcome-coworking.com";
export const SITE_PHONE = "+33622805536";

export const SITE_ADDRESS = {
  streetAddress: "204 avenue de Colmar",
  postalCode: "67100",
  addressLocality: "Strasbourg",
  addressRegion: "Grand Est",
  addressCountry: "FR",
} as const;

/**
 * Coordonnées de l'établissement.
 *
 * À faire correspondre exactement au point de la fiche d'établissement Google :
 * un écart entre les deux brouille la réconciliation d'entité et dégrade le
 * référencement local.
 */
export const SITE_GEO = { latitude: 48.5528, longitude: 7.7472 } as const;

/** Forme documentée et stable de l'URL Maps (Maps URLs API). */
export const SITE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    `${SITE_ADDRESS.streetAddress}, ${SITE_ADDRESS.postalCode} ${SITE_ADDRESS.addressLocality}`,
  );

/**
 * Balises `geo.*` et `ICBM`, héritées de l'ère GeoURL.
 *
 * À ne pas surestimer : aucun moteur majeur ne les exploite, Google s'appuie sur
 * le JSON-LD `LocalBusiness` et sur la fiche d'établissement. Elles sont incluses
 * parce qu'elles ne coûtent rien et que certains annuaires et agrégateurs locaux
 * les lisent encore — pas parce qu'elles pèsent sur le classement Google.
 */
export const GEO_META = {
  // FR-67 = Bas-Rhin (ISO 3166-2).
  "geo.region": "FR-67",
  "geo.placename": SITE_ADDRESS.addressLocality,
  "geo.position": `${SITE_GEO.latitude};${SITE_GEO.longitude}`,
  ICBM: `${SITE_GEO.latitude}, ${SITE_GEO.longitude}`,
} as const;

export const SITE_SOCIAL_LINKS = [
  "https://www.facebook.com/WelcomeCoworking",
  "https://www.instagram.com/welcome_coworking_strasbourg/",
  "https://www.linkedin.com/in/buzz-capital-moyne/",
] as const;

/**
 * Visuel de partage : 1200 × 630 (ratio 1.905, la forme attendue par les cartes
 * sociales), JPEG de ~156 Ko. Le poids compte autant que les dimensions : WhatsApp
 * n'affiche pas de vignette au-delà d'environ 300 Ko.
 *
 * Servi depuis `public/` et non via la convention `src/app/opengraph-image.jpg` :
 * cette dernière produit une URL empreintée, impossible à référencer ici, et elle
 * disparaît des pages qui déclarent leur propre `openGraph` (voir ci-dessous).
 */
export const OG_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Espace de coworking Welcome à Strasbourg : bar en bois, verrières noires, plantes et éclairage chaleureux",
};

/**
 * Next.js remplace l'objet `openGraph` du layout parent au lieu de le fusionner :
 * toute page qui déclare son propre `openGraph` doit donc réinjecter ces valeurs,
 * sinon `og:site_name`, `og:locale` et `og:image` disparaissent de la page.
 */
export const OG_DEFAULTS = {
  // Pas d'`as const` sur l'objet : Next attend un `OGImage[]` mutable, qu'un tableau
  // figé par `as const` ne satisfait pas. Seul `type` a besoin d'être littéral.
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "fr_FR",
  images: [OG_IMAGE],
};

/** Fiche entreprise, injectée sur toutes les pages via le root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: `${SITE_URL}/`,
    // 512 px : l'ancien favicon 64 px passait sous le minimum de 112 px que Google
    // recommande pour le logo d'une `Organization`.
    logo: `${SITE_URL}/logo.png`,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: { "@type": "PostalAddress", ...SITE_ADDRESS },
    sameAs: [...SITE_SOCIAL_LINKS],
    // Rattache l'entité à son SIREN : identifiant officiel, très fiable pour la
    // désambiguïsation d'une entreprise française.
    identifier: {
      "@type": "PropertyValue",
      propertyID: "SIREN",
      value: "825282551",
    },
    vatID: "FR71825282551",
  };
}

/**
 * Fiche établissement local, réservée à la page d'accueil.
 *
 * Ne prend plus le visuel en paramètre : il est ici constant, ce qui évite qu'un
 * appelant y réinjecte le PNG source de 2,6 Mo. `OG_IMAGE` fait 1200 px de large,
 * soit le minimum recommandé par Google pour les données structurées.
 */
export function localBusinessJsonLd() {
  const imageUrl = `${SITE_URL}${OG_IMAGE.url}`;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#coworking`,
    name: SITE_NAME,
    description:
      "Espace de coworking premium à Strasbourg : open space, bureaux privatifs, salle de réunion, cuisine et espace détente.",
    url: `${SITE_URL}/`,
    image: imageUrl,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    priceRange: "€€",
    foundingDate: "2017",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    address: { "@type": "PostalAddress", ...SITE_ADDRESS },
    geo: { "@type": "GeoCoordinates", ...SITE_GEO },
    hasMap: SITE_MAP_URL,
    // Aide Google à rattacher ce balisage à la fiche d'établissement et aux profils.
    sameAs: [...SITE_SOCIAL_LINKS],
    areaServed: [
      { "@type": "City", name: "Strasbourg" },
      { "@type": "City", name: "Illkirch-Graffenstaden" },
    ],
    /*
     * Desserte, exprimée avec `additionalProperty` / `PropertyValue` : c'est le
     * seul mécanisme générique valide sur `Place` pour ce type d'information.
     */
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Arrêt de tram le plus proche",
        value: "Couffignal (lignes A et E)",
      },
      { "@type": "PropertyValue", name: "Stationnement", value: "Gratuit autour du bâtiment" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi fibre", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking gratuit", value: true },
      { "@type": "LocationFeatureSpecification", name: "Salle de réunion", value: true },
      {
        "@type": "LocationFeatureSpecification",
        name: "Cuisine et espace détente",
        value: true,
      },
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Open space en coworking" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bureau privatif" } },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Location de salle de réunion" },
      },
    ],
  };
}

/** Fil d'Ariane : aide Google à afficher la hiérarchie du site dans les résultats. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** `category` est une clé stable (`space`, `pricing`, …), pas un libellé traduit. */
export type FaqItem = { question: string; answer: string; category: string };

/**
 * Rich result « questions fréquentes », réservé à la page /faq.
 *
 * Les questions sont passées en paramètre : elles vivent désormais dans les
 * messages de traduction, afin que le balisage soit dans la langue de la page.
 */
export function faqPageJsonLd(items: FaqItem[], pagePath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}${pagePath}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
