import { TOURISM_REGIONS, type TourismRegion } from "@/data/regions";

export type VtcLocation = {
  name: string;
  city: string;
  department: string;
  departmentCode: string;
  region: string;
  regionCode: string;
  lat: number;
  lon: number;
  tourismRegion?: string;
  source?: "device" | "default" | "external";
};

export const DEFAULT_VTC_LOCATION: VtcLocation = {
  name: "Strasbourg",
  city: "Strasbourg",
  department: "Bas-Rhin",
  departmentCode: "67",
  region: "Grand Est",
  regionCode: "44",
  lat: 48.5734,
  lon: 7.7521,
  source: "default",
};

const FRENCH_DEPARTMENT_BOUNDS = [
  { minLat: 41, maxLat: 51.6, minLon: -5.6, maxLon: 10 }, // France métropolitaine
  { minLat: 15.8, maxLat: 16.6, minLon: -61.9, maxLon: -60.9 }, // Guadeloupe
  { minLat: 14.3, maxLat: 14.95, minLon: -61.3, maxLon: -60.7 }, // Martinique
  { minLat: 2, maxLat: 6, minLon: -55, maxLon: -51 }, // Guyane
  { minLat: -21.5, maxLat: -20.8, minLon: 55.1, maxLon: 55.9 }, // La Réunion
  { minLat: -13.1, maxLat: -12.5, minLon: 44.9, maxLon: 45.4 }, // Mayotte
] as const;

export function isWithinFrenchDepartments(lat: number, lon: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    FRENCH_DEPARTMENT_BOUNDS.some(
      (bounds) =>
        lat >= bounds.minLat &&
        lat <= bounds.maxLat &&
        lon >= bounds.minLon &&
        lon <= bounds.maxLon,
    )
  );
}

const CULTURAL_ZONE_ALIASES: Record<string, string> = {
  strasbourg: "alsace",
  colmar: "alsace",
  mulhouse: "alsace",
  reims: "champagne",
  nice: "cote-azur",
  cannes: "cote-azur",
  lyon: "lyonnais",
  bordeaux: "bordelais",
  marseille: "provence",
};

const normalize = (value?: string) =>
  value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim() ?? "";

export function resolveTourismRegion(location: Partial<VtcLocation>): {
  id: string;
  displayName: string;
  content: TourismRegion | null;
} {
  const city = normalize(location.city ?? location.name);
  const department = normalize(location.department);
  const explicitId = CULTURAL_ZONE_ALIASES[city];
  const content = TOURISM_REGIONS.find(
    (item) =>
      item.id === explicitId ||
      item.cities.some((candidate) => normalize(candidate) === city) ||
      item.departments.some((candidate) => normalize(candidate) === department),
  );

  if (content) return { id: content.id, displayName: content.displayName, content };

  const administrativeName = location.region?.trim() || "Votre région";
  return {
    id: explicitId ?? normalize(administrativeName).replace(/\s+/g, "-"),
    displayName: administrativeName,
    content: null,
  };
}

export async function reverseGeocodeVtcLocation(lat: number, lon: number): Promise<VtcLocation> {
  if (!isWithinFrenchDepartments(lat, lon)) return DEFAULT_VTC_LOCATION;
  const response = await fetch(`/api/vtc/commune?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new Error("location-unavailable");
  const data = (await response.json()) as Partial<VtcLocation>;
  if (!data.departmentCode) return DEFAULT_VTC_LOCATION;
  return {
    ...DEFAULT_VTC_LOCATION,
    ...data,
    name: data.city ?? data.name ?? DEFAULT_VTC_LOCATION.name,
    city: data.city ?? DEFAULT_VTC_LOCATION.city,
    lat,
    lon,
    source: "device",
  };
}
