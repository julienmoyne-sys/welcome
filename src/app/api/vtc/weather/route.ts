import { NextResponse } from "next/server";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    surface_pressure?: number;
  };
};

type OpenMeteoAirQualityResponse = {
  current?: { european_aqi?: number };
};

function validCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));

  if (!validCoordinate(latitude, longitude)) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code,surface_pressure",
    timezone: "auto",
  }).toString();

  const airQualityUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airQualityUrl.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "european_aqi",
    timezone: "auto",
  }).toString();

  try {
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl, { cache: "no-store" }),
      fetch(airQualityUrl, { cache: "no-store" }),
    ]);
    if (!weatherResponse.ok) throw new Error(`Weather HTTP ${weatherResponse.status}`);
    if (!airQualityResponse.ok) throw new Error(`Air quality HTTP ${airQualityResponse.status}`);
    const current = ((await weatherResponse.json()) as OpenMeteoResponse).current;
    const airQuality = ((await airQualityResponse.json()) as OpenMeteoAirQualityResponse).current;
    if (
      current?.temperature_2m === undefined ||
      current.weather_code === undefined ||
      current.surface_pressure === undefined ||
      airQuality?.european_aqi === undefined
    ) {
      throw new Error("Réponse météo invalide");
    }

    return NextResponse.json(
      {
        temperature: current.temperature_2m,
        weatherCode: current.weather_code,
        pressure: current.surface_pressure,
        europeanAqi: airQuality.european_aqi,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ error: "Météo indisponible" }, { status: 503 });
  }
}
