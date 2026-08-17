import type { StaticImageData } from "next/image";

export type RegionalCard = {
  title: string;
  description: string;
  image: StaticImageData;
  distanceKm?: number;
  category?: string;
  location?: string;
};

export type LocalSport = RegionalCard & {
  venue: string;
};

export type TourismRegion = {
  id: string;
  displayName: string;
  administrativeRegion: string;
  cities: string[];
  departments: string[];
  heroImage: StaticImageData;
  introduction: string;
  facts: string[];
  gastronomy: RegionalCard[];
  placesToVisit: RegionalCard[];
  activities: RegionalCard[];
  driverFavorites: RegionalCard[];
  localSports: LocalSport[];
};
