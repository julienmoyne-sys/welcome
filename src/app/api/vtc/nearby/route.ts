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

const TOURISM_TOP_LIMIT = 10;
const DISPLAYED_TOURISM_LIMIT = 8;
const REGIONAL_SEARCH_RADIUS_METERS = 50_000;

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
    .filter((point) => point.category === "Site touristique")
    .filter((point) => point.distanceMeters <= 25_000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function importance(tags: Record<string, string>) {
  return (
    (tags.wikipedia ? 8 : 0) +
    (tags.wikidata ? 6 : 0) +
    (tags.heritage || tags["heritage:operator"] ? 5 : 0) +
    (["attraction", "museum", "gallery", "viewpoint", "zoo", "theme_park", "aquarium"].includes(
      tags.tourism,
    )
      ? 4
      : 0) +
    (tags.historic ? 3 : 0) +
    (tags.website ? 1 : 0)
  );
}

function wikipediaImportance(title: string) {
  const normalized = title.toLocaleLowerCase("fr");
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
    "mémorial",
    "hôtel de ville",
    "église",
    "synagogue",
    "temple",
    "quartier historique",
  ];
  return landmarks.reduce((score, keyword) => score + (normalized.includes(keyword) ? 5 : 0), 0);
}

function wikipediaCategory() {
  return "Site touristique";
}

function isRelevantWikipediaPlace(title: string) {
  const normalized = normalizeName(title);
  if (/(gare|aeroport|aerodrome|stade|football|centre commercial|hopital)/.test(normalized))
    return false;
  return wikipediaImportance(title) >= 5;
}

function isRelevantOsmPlace(name: string, tags: Record<string, string>) {
  void name;
  return importance(tags) >= 4;
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
>(candidates: T[], _route: Coordinate[] | undefined, limit: number) {
  return [...candidates]
    .sort((a, b) => b.importance - a.importance || a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
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
              category: wikipediaCategory(),
              importance: wikipediaImportance(place.title),
              distanceMeters: Math.round(
                alongRoute?.distance ?? distanceInMeters(latitude, longitude, place.lat, place.lon),
              ),
            },
          ];
        })
      : [],
  );

  return selectPoints(candidates, route, TOURISM_TOP_LIMIT)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, DISPLAYED_TOURISM_LIMIT)
    .map(({ importance: _importance, ...point }) => point);
}

async function findPoints(latitude: number, longitude: number, route?: Coordinate[]) {
  const sampledRoute = route?.filter(
    (_, index) => index % Math.max(1, Math.ceil(route.length / 12)) === 0,
  );
  if (route?.length && sampledRoute && sampledRoute.at(-1) !== route.at(-1))
    sampledRoute.push(route.at(-1)!);
  const filter = sampledRoute?.length
    ? `(around:30000,${sampledRoute.flat().join(",")})`
    : `(around:${REGIONAL_SEARCH_RADIUS_METERS},${latitude},${longitude})`;
  const query = route?.length
    ? `[out:json][timeout:30];(
        nwr${filter}[name][tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium)$"];
        nwr${filter}[name][historic~"^(castle|monument|archaeological_site|fort)$"];
        nwr${filter}[name][heritage];
      );out center tags;`
    : `[out:json][timeout:25];(
        nwr${filter}[name][tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium)$"];
        nwr${filter}[name][historic~"^(castle|monument|archaeological_site|fort)$"];
        nwr${filter}[name][heritage];
      );out center tags;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      signal: AbortSignal.timeout(10_000),
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
    // Le classement constitue la liste dynamique des dix incontournables du
    // secteur : notoriété documentée d'abord, puis proximité avec le visiteur.
    const points = selectPoints(candidates, route, TOURISM_TOP_LIMIT)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, DISPLAYED_TOURISM_LIMIT)
      .map(({ importance: _importance, ...point }) => point);
    if (points.length > 0) return points;
  } catch {
    // Le service Overpass public peut être saturé : la recherche nationale
    // Wikipédia ci-dessous garantit un second fournisseur sans clé API.
  }

  const wikipediaPoints = await findWikipediaPoints(latitude, longitude, route).catch(() => []);
  if (wikipediaPoints.length > 0) return wikipediaPoints;
  const fallbackPoints = route?.length ? [] : fixedPoints(latitude, longitude);
  return fallbackPoints;
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
  if (!validPosition(latitude, longitude))
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  return NextResponse.json({ points: await findPoints(latitude, longitude) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    latitude?: number;
    longitude?: number;
    route?: Coordinate[];
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
    points: await findPoints(latitude, longitude, route),
  });
}
