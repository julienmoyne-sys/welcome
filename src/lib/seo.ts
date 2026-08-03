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

export type FaqItem = { question: string; answer: string; category: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "L'espace & les équipements",
    question: "Quels équipements sont mis à disposition des coworkers ?",
    answer:
      "Wi-Fi fibre, cuisine équipée, salle de réunion, espaces détente, imprimante, casiers, vélos en libre-service et stationnement gratuit autour de l'immeuble.",
  },
  {
    category: "L'espace & les équipements",
    question: "La salle de réunion peut-elle accueillir des visioconférences ?",
    answer:
      "Oui, la salle de réunion est équipée pour vos réunions hybrides et visioconférences, avec connexion fibre stable et un écran partagé sur demande.",
  },
  {
    category: "L'espace & les équipements",
    question: "Le site est-il accessible aux personnes à mobilité réduite ?",
    answer:
      "L'immeuble dispose d'un accès de plain-pied et d'ascenseur. N'hésitez pas à nous préciser vos besoins lors de la visite pour vous accompagner au mieux.",
  },
  {
    category: "L'espace & les équipements",
    question: "Proposez-vous des événements ou des moments de rencontre entre coworkers ?",
    answer:
      "Welcome organise régulièrement des afterworks, petits-déjeuners et moments d'échange pour favoriser les rencontres professionnelles et la convivialité.",
  },
  {
    category: "Formules & tarifs",
    question: "Quelles solutions de travail propose Welcome Coworking ?",
    answer:
      "Trois solutions : l'open space en coworking pour les indépendants, les bureaux privatifs fermés pour les équipes, et la location de salle de réunion à l'heure ou à la journée. Cuisine, espace détente et Wi-Fi fibre sont inclus.",
  },
  {
    category: "Formules & tarifs",
    question: "Puis-je venir travailler une seule journée ou à l'heure ?",
    answer:
      "Oui, la formule Nomade permet de réserver à l'heure sans engagement, idéale pour une journée ponctuelle ou un créneau de quelques heures.",
  },
  {
    category: "Formules & tarifs",
    question: "Les bureaux privatifs sont-ils vraiment fermés et sécurisés ?",
    answer:
      "Oui, les bureaux privatifs sont des espaces clos, accessibles 24/7, avec accès autonome et possibilité d'y installer votre équipe et vos documents en toute sérénité.",
  },
  {
    category: "Formules & tarifs",
    question: "Quelle est la durée minimale d'engagement pour un bureau privatif ?",
    answer:
      "Les bureaux privatifs sont proposés sans minimum d'engagement pour offrir une grande flexibilité. Contactez-nous pour étudier l'offre adaptée à votre équipe.",
  },
  {
    category: "Formules & tarifs",
    question: "Puis-je utiliser Welcome comme adresse commerciale de mon entreprise ?",
    answer:
      "Oui, selon la formule choisie, Welcome peut servir d'adresse de domiciliation commerciale. Renseignez-vous auprès de notre équipe pour les conditions.",
  },
  {
    category: "Formules & tarifs",
    question: "Puis-je recevoir du courrier professionnel à Welcome ?",
    answer:
      "Oui, les formules incluent généralement une domiciliation d'entreprise et la réception de courrier. Contactez-nous pour connaître les modalités exactes.",
  },
  {
    category: "Accès & localisation",
    question: "Où se situe l'espace de coworking Welcome à Strasbourg ?",
    answer:
      "Welcome Coworking se trouve au 204 avenue de Colmar, 67100 Strasbourg, à l'arrêt de tram Couffignal, avec un parking gratuit, un accès direct à l'autoroute et une piste cyclable express vers le centre-ville.",
  },
  {
    category: "Accès & localisation",
    question: "Comment se rendre à Welcome depuis la gare de Strasbourg ?",
    answer:
      "En tram A ou E direction Robertsau, arrêt Couffignal situé au pied de l'immeuble. Comptez environ 15 minutes depuis la gare de Strasbourg.",
  },
  {
    category: "Accès & localisation",
    question: "Y a-t-il un parking pour les coworkers et leurs visiteurs ?",
    answer:
      "Oui, le stationnement est gratuit autour du bâtiment et facile d'accès, directement relié à l'autoroute et aux transports en commun.",
  },
  {
    category: "Accès & localisation",
    question: "Y a-t-il des commerces ou restaurants à proximité ?",
    answer:
      "Le quartier de la Robertsau et le secteur de la place de Haguenau offrent boulangeries, restaurants et commerces à quelques minutes à pied ou en tram.",
  },
  {
    category: "Réservation & engagement",
    question: "Quels sont les horaires d'accès ?",
    answer:
      "Les clients accèdent à l'espace 24h/24 et 7j/7. Les visites de découverte se font sur rendez-vous, à demander par le formulaire de contact, par téléphone au +33 6 22 80 55 36 ou par WhatsApp.",
  },
  {
    category: "Réservation & engagement",
    question: "Peut-on visiter l'espace avant de s'engager ?",
    answer:
      "Oui. La visite est libre et sans engagement : vous découvrez les espaces, l'ambiance et les services, puis vous choisissez la formule adaptée à votre rythme.",
  },
  {
    category: "Réservation & engagement",
    question: "Comment réserver une salle de réunion ?",
    answer:
      "La réservation se fait par téléphone, WhatsApp ou email à contact@welcome-coworking.com. Nous vous confirmons rapidement la disponibilité et les tarifs.",
  },
  {
    category: "Réservation & engagement",
    question: "Puis-je amener des clients ou collaborateurs ponctuellement ?",
    answer:
      "Oui, vous pouvez recevoir vos invités dans les espaces communs ou en salle de réunion. Prévenez-nous simplement à l'avance pour organiser l'accueil.",
  },
  {
    category: "À propos de Welcome",
    question: "Depuis quand Welcome Coworking existe-t-il ?",
    answer:
      "Welcome Coworking accueille des entreprises à Strasbourg depuis 2017 et a accompagné plus de 100 sociétés, indépendants et équipes en télétravail.",
  },
  {
    category: "Contact & services",
    question: "Comment contacter Welcome Coworking rapidement ?",
    answer:
      "Par téléphone au +33 6 22 80 55 36, par WhatsApp, par email à contact@welcome-coworking.com ou directement via le formulaire de contact du site.",
  },
];

/** Rich result « questions fréquentes », réservé à la page /faq. */
export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
