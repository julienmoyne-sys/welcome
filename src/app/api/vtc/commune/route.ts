import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Commune = {
  nom?: string;
  departement?: { code?: string; nom?: string };
  region?: { code?: string; nom?: string };
};
type ElevationResponse = { elevation?: number };

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

  const params = new URLSearchParams({
    lat: latitude.toFixed(5),
    lon: longitude.toFixed(5),
    fields: "nom,departement,region",
    format: "json",
  });
  const elevationParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m",
  });
  const [response, elevationResponse] = await Promise.all([
    fetch(`https://geo.api.gouv.fr/communes?${params}`, { next: { revalidate: 300 } }),
    fetch(`https://api.open-meteo.com/v1/forecast?${elevationParams}`, {
      next: { revalidate: 3600 },
    }),
  ]);
  if (!response.ok) {
    return NextResponse.json({ city: null }, { status: 200 });
  }

  const communes = (await response.json()) as Commune[];
  const elevation = elevationResponse.ok
    ? ((await elevationResponse.json()) as ElevationResponse).elevation
    : undefined;
  return NextResponse.json(
    {
      city: communes[0]?.nom ?? null,
      department: communes[0]?.departement?.nom ?? null,
      departmentCode: communes[0]?.departement?.code ?? null,
      region: communes[0]?.region?.nom ?? null,
      regionCode: communes[0]?.region?.code ?? null,
      altitude: Number.isFinite(elevation) ? elevation : null,
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
