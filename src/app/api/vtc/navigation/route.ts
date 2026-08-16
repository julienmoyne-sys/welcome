import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GeocodingFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: { label?: string; name?: string };
};

type OsrmResponse = {
  code?: string;
  routes?: Array<{
    duration?: number;
    distance?: number;
    geometry?: { coordinates?: Array<[number, number]> };
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));

  if (
    query.length < 3 ||
    query.length > 200 ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json({ error: "Adresse ou position invalide" }, { status: 400 });
  }

  const geocodingParams = new URLSearchParams({ q: query, limit: "1", index: "address" });
  const geocodingResponse = await fetch(
    `https://data.geopf.fr/geocodage/search?${geocodingParams}`,
    { cache: "no-store" },
  );
  if (!geocodingResponse.ok) {
    return NextResponse.json({ error: "Recherche d’adresse indisponible" }, { status: 502 });
  }

  const geocoding = (await geocodingResponse.json()) as { features?: GeocodingFeature[] };
  const feature = geocoding.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
  }

  const [destinationLongitude, destinationLatitude] = coordinates;
  const routingBaseUrl = (process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org").replace(
    /\/$/,
    "",
  );
  const routingParams = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
  });
  const routingResponse = await fetch(
    `${routingBaseUrl}/route/v1/driving/${longitude},${latitude};${destinationLongitude},${destinationLatitude}?${routingParams}`,
    { cache: "no-store" },
  );
  if (!routingResponse.ok) {
    return NextResponse.json({ error: "Calcul d’itinéraire indisponible" }, { status: 502 });
  }

  const routing = (await routingResponse.json()) as OsrmResponse;
  const route = routing.routes?.[0];
  if (
    routing.code !== "Ok" ||
    !route?.geometry?.coordinates?.length ||
    !Number.isFinite(route.duration) ||
    !Number.isFinite(route.distance)
  ) {
    return NextResponse.json({ error: "Aucun trajet routier trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    destination: {
      label: feature.properties?.label ?? feature.properties?.name ?? query,
      latitude: destinationLatitude,
      longitude: destinationLongitude,
    },
    durationSeconds: route.duration,
    distanceMeters: route.distance,
    geometry: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
  });
}
