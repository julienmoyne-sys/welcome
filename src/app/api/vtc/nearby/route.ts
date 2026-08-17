import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Coordinate = [number, number];
type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};
type OverpassResponse = { elements?: OverpassElement[] };
type WikipediaGeoResult = {
  pageid: number;
  title: string;
  lat: number;
  lon: number;
  dist: number;
};
type WikipediaGeoResponse = { query?: { geosearch?: WikipediaGeoResult[] } };
type NominatimResult = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
};
type PointOfInterest = {
  id: string;
  name: string;
  category: string;
  distanceMeters: number;
};

const FIXED_POINTS = [
  {
    id: "cathedrale",
    name: "Cathédrale Notre-Dame",
    category: "Site touristique",
    lat: 48.5818,
    lon: 7.7508,
  },
  { id: "gare-strasbourg", name: "Gare de Strasbourg", category: "Gare", lat: 48.585, lon: 7.7346 },
  {
    id: "aeroport-strasbourg",
    name: "Aéroport de Strasbourg",
    category: "Aéroport",
    lat: 48.5383,
    lon: 7.6282,
  },
  {
    id: "stade-meinau",
    name: "Stade de la Meinau",
    category: "Stade de football",
    lat: 48.5601,
    lon: 7.7549,
  },
] as const;

const radians = (value: number) => (value * Math.PI) / 180;
const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

const PROFESSIONAL_STADIUM_MARKERS = [
  "abbe-deschamps",
  "allianz riviera",
  "armand-cesari",
  "auguste-bonal",
  "auguste-delaune",
  "bauer",
  "beaujoire",
  "bollaert-delelis",
  "charlety",
  "francis-le ble",
  "francis-le-basser",
  "francois-coty",
  "geoffroy-guichard",
  "groupama stadium",
  "la licorne",
  "la meinau",
  "le moustoir",
  "louis-ii",
  "marcel-picot",
  "marie-marvingt",
  "matmut atlantique",
  "mauroy",
  "mosson",
  "nouste camp",
  "oceane",
  "parc des princes",
  "parc des sports d'annecy",
  "paul-lignon",
  "pierre-mauroy",
  "raymond-kopa",
  "roazhon park",
  "roudourou",
  "saint-symphorien",
  "stade des alpes",
  "stadium de toulouse",
  "tribut",
  "velodrome",
];

const MAJOR_STATION_CITIES = [
  "aix-en-provence",
  "amiens",
  "angers",
  "annecy",
  "avignon",
  "besancon",
  "bordeaux",
  "brest",
  "caen",
  "chambery",
  "clermont-ferrand",
  "dijon",
  "grenoble",
  "le havre",
  "le mans",
  "lille",
  "limoges",
  "lyon",
  "marseille",
  "metz",
  "montpellier",
  "mulhouse",
  "nancy",
  "nantes",
  "nice",
  "nimes",
  "orleans",
  "paris",
  "pau",
  "perpignan",
  "poitiers",
  "reims",
  "rennes",
  "rouen",
  "saint-etienne",
  "strasbourg",
  "toulon",
  "toulouse",
  "tours",
];

function isProfessionalStadium(name: string) {
  const normalized = normalizeName(name);
  return PROFESSIONAL_STADIUM_MARKERS.some((marker) => normalized.includes(marker));
}

function isMajorStation(name: string) {
  const normalized = normalizeName(name);
  const mainTerminalMarkers = [
    "-ville",
    "austerlitz",
    "flandres",
    "gare de l'est",
    "gare de lyon",
    "gare du nord",
    "matabiau",
    "montparnasse",
    "part-dieu",
    "perrache",
    "saint-charles",
    "saint-jean",
    "saint-lazare",
  ];
  return (
    !/(ancienne|marchandises|triage|desaffectee|fermee)/.test(normalized) &&
    MAJOR_STATION_CITIES.some(
      (city) =>
        normalized === `gare de ${city}` ||
        (normalized.includes(city) &&
          mainTerminalMarkers.some((marker) => normalized.includes(marker))),
    )
  );
}

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function category(tags: Record<string, string>) {
  if (tags.shop === "tobacco") return "Bureau de tabac";
  if (tags.aeroway === "aerodrome") return "Aéroport";
  if (tags.railway === "station") return "Gare";
  if (tags.leisure === "stadium" || tags.sport === "soccer") return "Stade de football";
  return "Site touristique";
}

function fixedPoints(latitude: number, longitude: number) {
  return FIXED_POINTS.map((point) => ({
    id: point.id,
    name: point.name,
    category: point.category,
    distanceMeters: Math.round(distanceInMeters(latitude, longitude, point.lat, point.lon)),
  }))
    .filter((point) => point.distanceMeters <= 25_000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function importance(tags: Record<string, string>) {
  return (
    (tags.shop === "tobacco" ? 16 : 0) +
    (tags.aeroway === "aerodrome" ? 15 : 0) +
    (tags.railway === "station" ? 14 : 0) +
    (tags.leisure === "stadium" && tags.sport === "soccer" ? 13 : 0) +
    (tags.wikipedia ? 8 : 0) +
    (tags.wikidata ? 6 : 0) +
    (tags.heritage || tags["heritage:operator"] ? 5 : 0) +
    (["attraction", "museum", "gallery", "zoo", "theme_park"].includes(tags.tourism) ? 4 : 0) +
    (tags.historic ? 3 : 0) +
    (tags.website ? 1 : 0)
  );
}

function wikipediaImportance(title: string) {
  const normalized = title.toLocaleLowerCase("fr");
  const usefulPlaces = ["aéroport", "aérodrome", "gare de ", "stade", "football"];
  const landmarks = [
    "cathédrale",
    "château",
    "musée",
    "monument",
    "palais",
    "basilique",
    "abbaye",
    "citadelle",
    "fort",
    "parc",
    "jardin",
    "théâtre",
    "opéra",
    "tour ",
    "place ",
  ];
  return (
    usefulPlaces.reduce((score, keyword) => score + (normalized.includes(keyword) ? 8 : 0), 1) +
    landmarks.reduce((score, keyword) => score + (normalized.includes(keyword) ? 5 : 0), 0)
  );
}

function wikipediaCategory(title: string) {
  const normalized = title.toLocaleLowerCase("fr");
  if (normalized.includes("aéroport") || normalized.includes("aérodrome")) return "Aéroport";
  if (normalized.includes("gare de ") || normalized.startsWith("gare ")) return "Gare";
  if (normalized.includes("stade") || normalized.includes("football")) return "Stade de football";
  return "Site touristique";
}

function isRelevantWikipediaPlace(title: string) {
  const normalized = normalizeName(title);
  const placeCategory = wikipediaCategory(title);
  if (placeCategory === "Stade de football") return isProfessionalStadium(title);
  if (placeCategory === "Aéroport")
    return normalized.includes("aeroport") && !normalized.includes("aerodrome");
  if (placeCategory === "Gare") return isMajorStation(title);
  return true;
}

function isRelevantOsmPlace(name: string, tags: Record<string, string>) {
  const placeCategory = category(tags);
  if (placeCategory === "Bureau de tabac") return true;
  if (placeCategory === "Stade de football") {
    const capacity = Number(tags.capacity?.replace(/\D/g, ""));
    return isProfessionalStadium(name) || (Number.isFinite(capacity) && capacity >= 8_000);
  }
  if (placeCategory === "Aéroport") {
    return Boolean(tags.iata) || ["international", "regional"].includes(tags["aerodrome:type"]);
  }
  if (placeCategory === "Gare") return isMajorStation(name);
  return true;
}

function isUsefulWikipediaPlace(title: string) {
  return !/^(canton|arrondissement|quartier|circonscription|communauté|liste |histoire de |géographie de )/i.test(
    title,
  );
}

function nearestRouteIndex(route: Coordinate[], latitude: number, longitude: number) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  route.forEach(([lat, lon], index) => {
    const distance = distanceInMeters(lat, lon, latitude, longitude);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });
  return { index: nearestIndex, distance: nearestDistance };
}

function routeDistance(
  route: Coordinate[],
  currentLat: number,
  currentLon: number,
  lat: number,
  lon: number,
) {
  const current = nearestRouteIndex(route, currentLat, currentLon);
  const point = nearestRouteIndex(route, lat, lon);
  if (point.index < current.index) return null;
  let distance = 0;
  for (let index = current.index + 1; index <= point.index; index += 1) {
    distance += distanceInMeters(
      route[index - 1][0],
      route[index - 1][1],
      route[index][0],
      route[index][1],
    );
  }
  return { distance, detour: point.distance };
}

function selectPoints<
  T extends { id: string; category: string; importance: number; distanceMeters: number },
>(candidates: T[], route: Coordinate[] | undefined, limit: number) {
  const ranked = [...candidates].sort(
    (a, b) => b.importance - a.importance || a.distanceMeters - b.distanceMeters,
  );
  if (!route?.length) {
    const selected: T[] = [];
    const categoryCounts = new Map<string, number>();
    ranked.forEach((point) => {
      const count = categoryCounts.get(point.category) ?? 0;
      if (selected.length < limit && count < 2) {
        selected.push(point);
        categoryCounts.set(point.category, count + 1);
      }
    });
    return selected.slice(0, limit).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  const routeLength = route
    .slice(1)
    .reduce(
      (total, [lat, lon], index) =>
        total + distanceInMeters(route[index][0], route[index][1], lat, lon),
      0,
    );
  const segmentLength = Math.max(1, routeLength / limit);
  const bestBySegment = new Map<number, T>();
  ranked.forEach((point) => {
    const segment = Math.min(limit - 1, Math.floor(point.distanceMeters / segmentLength));
    if (!bestBySegment.has(segment)) bestBySegment.set(segment, point);
  });

  const selected: T[] = [];
  const categoryCounts = new Map<string, number>();
  [...bestBySegment.values()]
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .forEach((point) => {
      const count = categoryCounts.get(point.category) ?? 0;
      if (count < 3) {
        selected.push(point);
        categoryCounts.set(point.category, count + 1);
      }
    });
  const selectedIds = new Set(selected.map((point) => point.id));
  ranked.forEach((point) => {
    const count = categoryCounts.get(point.category) ?? 0;
    if (selected.length < limit && !selectedIds.has(point.id) && count < 3) {
      selected.push(point);
      selectedIds.add(point.id);
      categoryCounts.set(point.category, count + 1);
    }
  });
  return selected.slice(0, limit).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

async function findWikipediaPoints(latitude: number, longitude: number, route?: Coordinate[]) {
  const source = route?.length ? route : ([[latitude, longitude]] as Coordinate[]);
  const requestedSamples = route?.length
    ? Math.min(12, Math.max(2, Math.ceil(route.length / 35)))
    : 1;
  const samples = Array.from({ length: requestedSamples }, (_, index) => {
    const routeIndex = Math.round(
      (index * (source.length - 1)) / Math.max(1, requestedSamples - 1),
    );
    return source[routeIndex];
  });

  const responses = await Promise.allSettled(
    samples.map(async ([lat, lon]) => {
      const params = new URLSearchParams({
        action: "query",
        list: "geosearch",
        gscoord: `${lat}|${lon}`,
        gsradius: "10000",
        gslimit: route?.length ? "100" : "500",
        gsnamespace: "0",
        format: "json",
        origin: "*",
      });
      const response = await fetch(`https://fr.wikipedia.org/w/api.php?${params}`, {
        headers: { "User-Agent": "Welcome-VTC/1.0 (contact@welcome-coworking.com)" },
        signal: AbortSignal.timeout(8_000),
        next: { revalidate: 900 },
      });
      if (!response.ok) throw new Error(`Wikipedia ${response.status}`);
      return ((await response.json()) as WikipediaGeoResponse).query?.geosearch ?? [];
    }),
  );

  const seen = new Set<string>();
  const candidates = responses.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.flatMap((place) => {
          const normalizedName = place.title.toLocaleLowerCase("fr");
          if (
            seen.has(normalizedName) ||
            !isUsefulWikipediaPlace(place.title) ||
            !isRelevantWikipediaPlace(place.title)
          )
            return [];
          const alongRoute = route?.length
            ? routeDistance(route, latitude, longitude, place.lat, place.lon)
            : undefined;
          if (route?.length && (!alongRoute || alongRoute.detour > 30_000)) return [];
          seen.add(normalizedName);
          return [
            {
              id: `wikipedia-${place.pageid}`,
              name: place.title,
              category: wikipediaCategory(place.title),
              importance: wikipediaImportance(place.title),
              distanceMeters: Math.round(
                alongRoute?.distance ?? distanceInMeters(latitude, longitude, place.lat, place.lon),
              ),
            },
          ];
        })
      : [],
  );

  return selectPoints(candidates, route, 8).map(({ importance: _importance, ...point }) => point);
}

async function includeNearbyTobacco(
  points: PointOfInterest[],
  latitude: number,
  longitude: number,
  city: string | undefined,
  route?: Coordinate[],
) {
  if (
    !city ||
    points.some((point) => point.category === "Bureau de tabac" && point.distanceMeters <= 5_000)
  )
    return points.slice(0, 8);

  const latitudeDelta = 5 / 111;
  const longitudeDelta = 5 / Math.max(20, 111 * Math.cos(radians(latitude)));
  const params = new URLSearchParams({
    format: "jsonv2",
    q: `Tabac ${city}`,
    viewbox: `${longitude - longitudeDelta},${latitude + latitudeDelta},${longitude + longitudeDelta},${latitude - latitudeDelta}`,
    bounded: "1",
    limit: "5",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "Welcome-VTC/1.0 (contact@welcome-coworking.com)" },
    signal: AbortSignal.timeout(5_000),
    next: { revalidate: 900 },
  });
  if (!response.ok) return points.slice(0, 8);
  const results = (await response.json()) as NominatimResult[];
  const tobacco = results.flatMap((result) => {
    const lat = Number(result.lat);
    const lon = Number(result.lon);
    const directDistance = distanceInMeters(latitude, longitude, lat, lon);
    const alongRoute = route?.length
      ? routeDistance(route, latitude, longitude, lat, lon)
      : undefined;
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      directDistance > 5_000 ||
      (route?.length && (!alongRoute || alongRoute.detour > 5_000))
    )
      return [];
    return [
      {
        id: `nominatim-tobacco-${result.place_id}`,
        name: result.name?.trim() || result.display_name.split(",")[0],
        category: "Bureau de tabac",
        distanceMeters: Math.round(directDistance),
      },
    ];
  })[0];
  if (!tobacco) return points.slice(0, 8);

  return [...points.filter((point) => point.category !== "Bureau de tabac").slice(0, 7), tobacco]
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 8);
}

async function findPoints(
  latitude: number,
  longitude: number,
  route?: Coordinate[],
  city?: string,
) {
  const sampledRoute = route?.filter(
    (_, index) => index % Math.max(1, Math.ceil(route.length / 12)) === 0,
  );
  if (route?.length && sampledRoute && sampledRoute.at(-1) !== route.at(-1))
    sampledRoute.push(route.at(-1)!);
  const filter = sampledRoute?.length
    ? `(around:30000,${sampledRoute.flat().join(",")})`
    : `(around:12000,${latitude},${longitude})`;
  const query = route?.length
    ? `[out:json][timeout:30];(
        nwr${filter}[name][shop=tobacco];
        nwr${filter}[name][leisure=stadium][sport=soccer];
        nwr${filter}[name][railway=station];
        nwr${filter}[name][aeroway=aerodrome];
        nwr${filter}[name][tourism~"^(attraction|museum|viewpoint|zoo|theme_park)$"];
        nwr${filter}[name][historic~"^(castle|monument|archaeological_site|fort)$"];
        nwr${filter}[name][heritage];
      );out center tags;`
    : `[out:json][timeout:15];(
        nwr${filter}[name][shop=tobacco];
        nwr${filter}[name][leisure=stadium][sport=soccer];
        nwr${filter}[name][railway=station];
        nwr${filter}[name][aeroway=aerodrome];
        nwr${filter}[name][tourism~"^(attraction|museum|viewpoint|zoo|theme_park)$"];
        nwr${filter}[name][historic~"^(castle|monument|archaeological_site|fort)$"];
        nwr${filter}[name][heritage];
      );out center tags;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);

    const data = (await response.json()) as OverpassResponse;
    const seen = new Set<string>();
    const candidates = (data.elements ?? []).flatMap((element) => {
      const name = element.tags?.name?.trim();
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (
        !name ||
        lat == null ||
        lon == null ||
        seen.has(name.toLocaleLowerCase("fr")) ||
        !isRelevantOsmPlace(name, element.tags ?? {})
      )
        return [];
      const alongRoute = route?.length
        ? routeDistance(route, latitude, longitude, lat, lon)
        : undefined;
      if (route?.length && !alongRoute) return [];
      if (alongRoute && alongRoute.detour > 30_000) return [];
      seen.add(name.toLocaleLowerCase("fr"));
      return [
        {
          id: `${element.id}-${name}`,
          name,
          category: category(element.tags ?? {}),
          importance: importance(element.tags ?? {}),
          distanceMeters: Math.round(
            alongRoute?.distance ?? distanceInMeters(latitude, longitude, lat, lon),
          ),
        },
      ];
    });
    const points = selectPoints(candidates, route, 8).map(
      ({ importance: _importance, ...point }) => point,
    );
    if (points.length > 0)
      return includeNearbyTobacco(points, latitude, longitude, city, route).catch(() => points);
  } catch {
    // Le service Overpass public peut être saturé : la recherche nationale
    // Wikipédia ci-dessous garantit un second fournisseur sans clé API.
  }

  const wikipediaPoints = await findWikipediaPoints(latitude, longitude, route).catch(() => []);
  if (wikipediaPoints.length > 0)
    return includeNearbyTobacco(wikipediaPoints, latitude, longitude, city, route).catch(
      () => wikipediaPoints,
    );
  const fallbackPoints = route?.length ? [] : fixedPoints(latitude, longitude);
  return includeNearbyTobacco(fallbackPoints, latitude, longitude, city, route).catch(
    () => fallbackPoints,
  );
}

function validPosition(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));
  const city = url.searchParams.get("city")?.trim() || undefined;
  if (!validPosition(latitude, longitude))
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  return NextResponse.json({ points: await findPoints(latitude, longitude, undefined, city) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    latitude?: number;
    longitude?: number;
    route?: Coordinate[];
    city?: string;
  };
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const validRoute = Array.isArray(body.route)
    ? body.route.filter(
        (point): point is Coordinate =>
          Array.isArray(point) &&
          point.length === 2 &&
          validPosition(Number(point[0]), Number(point[1])),
      )
    : [];
  const sampleStep = Math.max(1, Math.ceil(validRoute.length / 500));
  const route = validRoute.filter((_, index) => index % sampleStep === 0);
  if (validRoute.length && route.at(-1) !== validRoute.at(-1)) route.push(validRoute.at(-1)!);
  if (!validPosition(latitude, longitude) || route.length < 2)
    return NextResponse.json({ error: "Trajet invalide" }, { status: 400 });
  return NextResponse.json({
    points: await findPoints(latitude, longitude, route, body.city?.trim() || undefined),
  });
}
