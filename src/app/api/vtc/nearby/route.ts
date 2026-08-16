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

const FIXED_POINTS = [
  {
    id: "cathedrale",
    name: "Cathédrale Notre-Dame",
    category: "Culture",
    lat: 48.5818,
    lon: 7.7508,
  },
  { id: "palais-rohan", name: "Palais Rohan", category: "Culture", lat: 48.581, lon: 7.7522 },
  {
    id: "parlement-europeen",
    name: "Parlement européen",
    category: "Business",
    lat: 48.5976,
    lon: 7.7689,
  },
  { id: "zenith", name: "Zénith de Strasbourg", category: "Loisirs", lat: 48.5933, lon: 7.6902 },
] as const;

const radians = (value: number) => (value * Math.PI) / 180;

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function category(tags: Record<string, string>) {
  if (tags.office || ["conference_centre", "coworking_space"].includes(tags.amenity))
    return "Business";
  if (tags.leisure || ["cinema", "theatre", "casino"].includes(tags.amenity)) return "Loisirs";
  return "Culture";
}

function fixedPoints(latitude: number, longitude: number) {
  return FIXED_POINTS.map((point) => ({
    id: point.id,
    name: point.name,
    category: point.category,
    distanceMeters: Math.round(distanceInMeters(latitude, longitude, point.lat, point.lon)),
  })).sort((a, b) => a.distanceMeters - b.distanceMeters);
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

async function findPoints(latitude: number, longitude: number, route?: Coordinate[]) {
  const sampledRoute = route?.filter(
    (_, index) => index % Math.max(1, Math.ceil(route.length / 24)) === 0,
  );
  if (route?.length && sampledRoute && sampledRoute.at(-1) !== route.at(-1))
    sampledRoute.push(route.at(-1)!);
  const filter = sampledRoute?.length
    ? `(around:1800,${sampledRoute.flat().join(",")})`
    : `(around:12000,${latitude},${longitude})`;
  const query = `[out:json][timeout:15];(
    nwr${filter}[name][tourism];
    nwr${filter}[name][historic];
    nwr${filter}[name][leisure];
    nwr${filter}[name][office];
    nwr${filter}[name][amenity~"^(arts_centre|casino|cinema|conference_centre|coworking_space|theatre)$"];
  );out center tags;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      signal: AbortSignal.timeout(18_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);

    const data = (await response.json()) as OverpassResponse;
    const seen = new Set<string>();
    const points = (data.elements ?? [])
      .flatMap((element) => {
        const name = element.tags?.name?.trim();
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (!name || lat == null || lon == null || seen.has(name.toLocaleLowerCase("fr")))
          return [];
        const alongRoute = route?.length
          ? routeDistance(route, latitude, longitude, lat, lon)
          : undefined;
        if (route?.length && !alongRoute) return [];
        if (alongRoute && alongRoute.detour > 1_800) return [];
        seen.add(name.toLocaleLowerCase("fr"));
        return [
          {
            id: `${element.id}-${name}`,
            name,
            category: category(element.tags ?? {}),
            distanceMeters: Math.round(
              alongRoute?.distance ?? distanceInMeters(latitude, longitude, lat, lon),
            ),
          },
        ];
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 4);
    return points.length > 0 ? points : fixedPoints(latitude, longitude);
  } catch {
    return fixedPoints(latitude, longitude);
  }
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
  const route = Array.isArray(body.route)
    ? body.route
        .filter(
          (point): point is Coordinate =>
            Array.isArray(point) &&
            point.length === 2 &&
            validPosition(Number(point[0]), Number(point[1])),
        )
        .slice(0, 500)
    : [];
  if (!validPosition(latitude, longitude) || route.length < 2)
    return NextResponse.json({ error: "Trajet invalide" }, { status: 400 });
  return NextResponse.json({ points: await findPoints(latitude, longitude, route) });
}
