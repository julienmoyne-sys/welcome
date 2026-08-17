import { NextResponse } from "next/server";

import { DEFAULT_VTC_LOCATION, isWithinFrenchDepartments } from "@/lib/vtc-location";

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
    surface_pressure?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    wind_direction_10m?: number;
    visibility?: number;
  };
  daily?: { sunrise?: string[]; sunset?: string[] };
};

type AirQualityResponse = { current?: { european_aqi?: number; uv_index?: number } };

type FeaturedImageResponse = {
  image?: {
    title?: string;
    thumbnail?: { source?: string; width?: number; height?: number };
    file_page?: string;
    artist?: { text?: string };
    license?: { type?: string; url?: string };
    description?: { text?: string };
    structured?: { captions?: { fr?: string } };
  };
};

const NEWS_FEEDS = [
  { url: "https://www.france24.com/fr/rss", source: "France 24", tone: "news" },
  {
    url: "https://www.20minutes.fr/feeds/rss-insolite.xml",
    source: "20 Minutes · Insolite",
    tone: "light",
  },
] as const;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function xmlValue(item: string, tag: string) {
  return decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
}

async function fetchFeed(feed: (typeof NEWS_FEEDS)[number]) {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "Welcome-VTC/1.0 (contact@welcome-coworking.com)" },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`${feed.source} HTTP ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)].slice(0, 6).flatMap(([, item]) => {
    const title = xmlValue(item, "title");
    if (!title) return [];
    return [
      {
        title,
        link: xmlValue(item, "link"),
        publishedAt: xmlValue(item, "pubDate"),
        source: feed.source,
        tone: feed.tone,
      },
    ];
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedLat = Number(url.searchParams.get("lat"));
  const requestedLon = Number(url.searchParams.get("lon"));
  const useRequested = isWithinFrenchDepartments(requestedLat, requestedLon);
  const latitude = useRequested ? requestedLat : DEFAULT_VTC_LOCATION.lat;
  const longitude = useRequested ? requestedLon : DEFAULT_VTC_LOCATION.lon;

  const weatherParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility",
    daily: "sunrise,sunset",
    timezone: "auto",
    forecast_days: "1",
  });
  const airParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "european_aqi,uv_index",
    timezone: "auto",
  });
  const imageDate = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "/");

  const [weatherResult, airResult, featuredImageResult, ...feedResults] = await Promise.allSettled([
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`, { cache: "no-store" }).then(
      async (response) => {
        if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
        return response.json() as Promise<WeatherResponse>;
      },
    ),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams}`, {
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Air HTTP ${response.status}`);
      return response.json() as Promise<AirQualityResponse>;
    }),
    fetch(`https://fr.wikipedia.org/api/rest_v1/feed/featured/${imageDate}`, {
      headers: { "User-Agent": "Welcome-VTC/1.0 (contact@welcome-coworking.com)" },
      next: { revalidate: 3600 },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Wikimedia HTTP ${response.status}`);
      return response.json() as Promise<FeaturedImageResponse>;
    }),
    ...NEWS_FEEDS.map(fetchFeed),
  ]);

  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const air = airResult.status === "fulfilled" ? airResult.value : null;
  const featuredImage =
    featuredImageResult.status === "fulfilled" ? featuredImageResult.value.image : null;
  const headlines = feedResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      weather: weather?.current
        ? {
            ...weather.current,
            sunrise: weather.daily?.sunrise?.[0] ?? null,
            sunset: weather.daily?.sunset?.[0] ?? null,
            european_aqi: air?.current?.european_aqi ?? null,
            uv_index: air?.current?.uv_index ?? null,
          }
        : null,
      featuredImage: featuredImage?.thumbnail?.source
        ? {
            url: featuredImage.thumbnail.source,
            width: featuredImage.thumbnail.width ?? 960,
            height: featuredImage.thumbnail.height ?? 640,
            title:
              featuredImage.structured?.captions?.fr ??
              featuredImage.description?.text ??
              featuredImage.title?.replace(/^File:/, "") ??
              "Image du jour",
            author: featuredImage.artist?.text ?? "Wikimedia Commons",
            license: featuredImage.license?.type ?? "Licence libre",
            licenseUrl: featuredImage.license?.url ?? null,
            sourceUrl: featuredImage.file_page ?? "https://commons.wikimedia.org/",
          }
        : null,
      headlines,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
