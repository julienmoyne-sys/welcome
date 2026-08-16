import "server-only";

import type { LiveInfoResponse } from "@/features/display/types";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=48.5734&longitude=7.7521&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FParis";
const LOCAL_NEWS_URL = "https://actu.fr/strasbourg/rss.xml";
const FALLBACK_NEWS_URL = "https://www.france24.com/fr/rss";

type WeatherApiResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function getWeather(): Promise<LiveInfoResponse["weather"]> {
  const response = await fetch(WEATHER_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
  const current = ((await response.json()) as WeatherApiResponse).current;
  if (
    !current ||
    current.temperature_2m === undefined ||
    current.apparent_temperature === undefined ||
    current.relative_humidity_2m === undefined ||
    current.weather_code === undefined ||
    current.wind_speed_10m === undefined
  ) {
    throw new Error("Invalid weather response");
  }
  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
  };
}

async function getHeadlineFeed(
  url: string,
  source: string,
  scope: "local" | "world",
): Promise<LiveInfoResponse["headlines"]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`News HTTP ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, 4)
    .map(([, item]) => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
      return { title: decodeXml(title).trim(), source, scope };
    })
    .filter(({ title }) => title.length > 0);
}

async function getHeadlines(): Promise<LiveInfoResponse["headlines"]> {
  const feeds = await Promise.allSettled([
    getHeadlineFeed(LOCAL_NEWS_URL, "Actu Strasbourg", "local"),
    getHeadlineFeed(FALLBACK_NEWS_URL, "France 24", "world"),
  ]);
  const headlines = feeds.flatMap((feed) => (feed.status === "fulfilled" ? feed.value : []));
  if (headlines.length === 0) throw new Error("No news source available");
  return headlines;
}

export async function getLiveInfo(): Promise<LiveInfoResponse> {
  const [weather, headlines] = await Promise.allSettled([getWeather(), getHeadlines()]);

  return {
    updatedAt: new Date().toISOString(),
    weather: weather.status === "fulfilled" ? weather.value : null,
    headlines: headlines.status === "fulfilled" ? headlines.value : [],
    traffic: [],
  };
}
