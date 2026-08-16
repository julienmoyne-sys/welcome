import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements?: OverpassElement[] };

const radians = (value: number) => (value * Math.PI) / 180;

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6_371_000;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function category(tags: Record<string, string>) {
  if (tags.office || ["conference_centre", "coworking_space"].includes(tags.amenity)) {
    return "Business";
  }
  if (tags.leisure || ["cinema", "theatre", "casino"].includes(tags.amenity)) return "Loisirs";
  return "Culture";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  const filter = `[around:12000,${latitude},${longitude}]`;
  const query = `[out:json][timeout:12];(
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
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 300 },
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
        seen.add(name.toLocaleLowerCase("fr"));
        return [
          {
            id: `${element.id}-${name}`,
            name,
            category: category(element.tags ?? {}),
            distanceMeters: Math.round(distanceInMeters(latitude, longitude, lat, lon)),
          },
        ];
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 4);

    return NextResponse.json(
      { points },
      { headers: { "Cache-Control": "public, max-age=120, s-maxage=300" } },
    );
  } catch {
    return NextResponse.json({ points: [] }, { status: 200 });
  }
}
