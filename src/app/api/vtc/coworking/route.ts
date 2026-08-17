import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OsmElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type CoworkingSpace = {
  id: string;
  name: string;
  address: string | null;
  distanceKm: number;
  website: string | null;
  featured: boolean;
  rating: number | null;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = radians(lat2 - lat1);
  const deltaLon = radians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function address(tags: Record<string, string>) {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  return [street, city].filter(Boolean).join(", ") || null;
}

function rating(tags: Record<string, string>) {
  const raw = tags.rating ?? tags.stars ?? tags["review:rating"];
  if (!raw) return null;
  const value = Number(raw.replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(value) && value >= 0 && value <= 5 ? value : null;
}

function coordinate(element: OsmElement) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat: lat!, lon: lon! } : null;
}

function welcomeSpace(originLat: number, originLon: number): CoworkingSpace {
  const lat = 48.5572;
  const lon = 7.74742;
  return {
    id: "welcome-coworking-strasbourg",
    name: "Welcome! Coworking Strasbourg",
    address: "204 avenue de Colmar, 67100 Strasbourg",
    distanceKm: Number(distanceKm(originLat, originLon, lat, lon).toFixed(1)),
    website: "https://www.welcome-coworking.com",
    featured: true,
    rating: null,
  };
}

async function overpass(query: string) {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(22_000),
  });
  if (!response.ok) throw new Error(`Overpass ${response.status}`);
  const payload = (await response.json()) as { elements?: OsmElement[] };
  return payload.elements ?? [];
}

function spacesFromElements(
  elements: OsmElement[],
  cityName: string,
  originLat: number,
  originLon: number,
) {
  const isStrasbourg = normalize(cityName).includes("strasbourg");
  let spaces = elements
    .filter((element) => coordinate(element))
    .map((element): CoworkingSpace => {
      const point = coordinate(element)!;
      const tags = element.tags ?? {};
      const name = tags.name?.trim() || "Espace de coworking";
      const website = tags.website ?? tags["contact:website"] ?? null;
      const featured = normalize(name).includes("welcome") && isStrasbourg;
      return {
        id: `osm-${element.id}`,
        name,
        address: address(tags),
        distanceKm: Number(distanceKm(originLat, originLon, point.lat, point.lon).toFixed(1)),
        website: featured ? "https://www.welcome-coworking.com" : website,
        featured,
        rating: rating(tags),
      };
    })
    .filter(
      (space, index, allSpaces) =>
        allSpaces.findIndex((candidate) => normalize(candidate.name) === normalize(space.name)) ===
        index,
    )
    .sort(
      (first, second) =>
        (second.rating ?? -1) - (first.rating ?? -1) || first.distanceKm - second.distanceKm,
    );

  if (isStrasbourg) {
    spaces = spaces.filter((space) => !normalize(space.name).includes("welcome"));
    spaces.unshift(welcomeSpace(originLat, originLon));
  }
  return spaces.slice(0, 6);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const requestedCity = params.get("city")?.trim() ?? "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ status: "invalid-request", spaces: [] }, { status: 400 });
  }

  try {
    const elements = await overpass(`[out:json][timeout:20];(
      node(around:250000,${lat},${lon})["place"="city"];
      nwr(around:250000,${lat},${lon})["office"="coworking"];
      nwr(around:250000,${lat},${lon})["amenity"="coworking_space"];
    );out center tags;`);
    const cities = elements
      .filter((element) => element.tags?.place === "city" && coordinate(element))
      .map((element) => {
        const point = coordinate(element)!;
        return {
          name: element.tags?.name ?? requestedCity,
          lat: point.lat,
          lon: point.lon,
          population: Number((element.tags?.population ?? "0").replace(/\D/g, "")),
          distance: distanceKm(lat, lon, point.lat, point.lon),
        };
      });
    const candidateCities = cities
      .filter((city) => city.population >= 50_000)
      .sort((first, second) => first.distance - second.distance)
      .slice(0, 10);
    if (!candidateCities.length) {
      candidateCities.push({ name: requestedCity, lat, lon, population: 0, distance: 0 });
    }

    let selectedCity = candidateCities[0];
    let spaces: CoworkingSpace[] = [];
    let fallback: { city: (typeof candidateCities)[number]; spaces: CoworkingSpace[] } | null =
      null;
    for (const city of candidateCities) {
      const nearbyElements = elements.filter((element) => {
        if (element.tags?.office !== "coworking" && element.tags?.amenity !== "coworking_space") {
          return false;
        }
        const point = coordinate(element);
        return point ? distanceKm(city.lat, city.lon, point.lat, point.lon) <= 25 : false;
      });
      const citySpaces = spacesFromElements(nearbyElements, city.name, lat, lon);
      if (!citySpaces.length) continue;
      fallback ??= { city, spaces: citySpaces };
      if (citySpaces.length < 6) continue;
      selectedCity = city;
      spaces = citySpaces;
      break;
    }
    if (!spaces.length && fallback) {
      selectedCity = fallback.city;
      spaces = fallback.spaces;
    }

    return NextResponse.json(
      { status: "ready", city: selectedCity.name, spaces },
      { headers: { "Cache-Control": "public, max-age=1800, s-maxage=21600" } },
    );
  } catch (error) {
    console.error("Unable to load coworking spaces", error);
    const isStrasbourg = normalize(requestedCity).includes("strasbourg");
    return NextResponse.json({
      status: "upstream-error",
      city: requestedCity,
      spaces: isStrasbourg ? [welcomeSpace(lat, lon)] : [],
    });
  }
}
