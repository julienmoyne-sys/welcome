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
  driver: { id: string; displayName: string };
  services: DriverService[];
  favorites: DriverFavorite[];
  source: "database" | "demo";
};

export const DEMO_DRIVER_CONTENT: DriverContent = {
  driver: { id: "demo-driver", displayName: "Votre chauffeur Welcome" },
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
