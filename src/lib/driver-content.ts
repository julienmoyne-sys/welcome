export type DriverService = {
  id: string;
  title: string;
  description: string;
  priceCents: number | null;
  currency: string;
};

export type DriverFavorite = {
  id: string;
  title: string;
  description: string;
  address: string | null;
};

export type DriverContent = {
  driver: {
    id: number;
    displayName: string;
    firstName: string;
    bio: string;
    otherActivities: string[];
    languages: string[];
    interests: string[];
    phone: string | null;
    email: string | null;
    website: string | null;
    vcard: string;
  };
  services: DriverService[];
  favorites: DriverFavorite[];
  source: "database" | "demo";
};

export const DEMO_DRIVER_CONTENT: DriverContent = {
  driver: {
    id: 1,
    displayName: "Votre chauffeur Welcome",
    firstName: "Alexandre",
    bio: "Chauffeur professionnel attentif, je veille à rendre chaque trajet agréable et serein.",
    otherActivities: ["Entrepreneur", "Ambassadeur local"],
    languages: ["Français", "Anglais", "Allemand"],
    interests: ["Voyages", "Gastronomie", "Patrimoine régional"],
    phone: "+33 6 22 80 55 36",
    email: "contact@welcome-coworking.com",
    website: "https://www.welcome-coworking.com",
    vcard:
      "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Votre chauffeur Welcome\r\nN:;Alexandre;;;\r\nTEL;TYPE=CELL:+33 6 22 80 55 36\r\nEMAIL;TYPE=INTERNET:contact@welcome-coworking.com\r\nURL:https://www.welcome-coworking.com\r\nNOTE:Chauffeur professionnel attentif, je veille à rendre chaque trajet agréable et serein.\r\nEND:VCARD",
  },
  services: [
    {
      id: "demo-service-water",
      title: "Bouteilles d’eau à disposition",
      description: "Une bouteille d’eau individuelle peut vous être proposée pendant le trajet.",
      priceCents: null,
      currency: "EUR",
    },
    {
      id: "demo-service-chewing-gum",
      title: "Chewing-gum",
      description: "Un paquet Freedent menthe ou fraîcheur.",
      priceCents: 200,
      currency: "EUR",
    },
  ],
  favorites: [
    {
      id: "demo-favorite-restaurant",
      title: "La Corde à Linge",
      description: "Une adresse conviviale appréciée du chauffeur au cœur de la Petite France.",
      address: "2 place Benjamin-Zix, 67000 Strasbourg",
    },
  ],
  source: "demo",
};
