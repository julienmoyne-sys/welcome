import type { StaticImageData } from "next/image";

import type { RegionalCard } from "@/data/regions";

export type DepartmentTourismContent = {
  code: string;
  name: string;
  welcomeTitle: string;
  introduction: string;
  introductionSourceUrl: string;
  heroImage: StaticImageData;
  facts: string[];
  placesToVisit: RegionalCard[];
  gastronomy: RegionalCard[];
  activities: RegionalCard[];
  driverFavorites: RegionalCard[];
};
