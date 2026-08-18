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

type SportsMatch = {
  home?: string;
  away?: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
  status?: string;
  time?: string;
  competition?: string;
  url?: string;
};

type StandingsResponse = {
  tables?: Array<{
    rows?: Array<{
      pos?: number;
      team?: string;
      p?: number;
      gd?: number;
      pts?: number;
    }>;
  }>;
};

const SPORTS_LEAGUES = [
  { id: "ligue-1", name: "Ligue 1", slug: "french-ligue-1" },
  { id: "premier-league", name: "Premier League", slug: "english-premier-league" },
  { id: "la-liga", name: "La Liga", slug: "spanish-la-liga" },
  { id: "serie-a", name: "Serie A", slug: "italian-serie-a" },
  { id: "bundesliga", name: "Bundesliga", slug: "bundesliga" },
] as const;

const SPORT_HEADERS = { "User-Agent": "Welcome-VTC/1.0 (contact@welcome-coworking.com)" };

function sportDate(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function fetchSportsDashboard() {
  const dateOffsets = Array.from({ length: 29 }, (_, index) => index - 7);
  const fetchLeagueFixtures = async (league: (typeof SPORTS_LEAGUES)[number]) => {
    const matches: SportsMatch[] = [];
    for (const offset of dateOffsets) {
      try {
        const response = await fetch(
          `https://sportscore.com/api/v1/fixtures/?sport=football&date=${sportDate(offset)}&competition=${league.slug}&limit=200`,
          { headers: SPORT_HEADERS, next: { revalidate: 3600 } },
        );
        if (!response.ok) continue;
        const payload = (await response.json()) as { matches?: SportsMatch[] };
        matches.push(...(payload.matches ?? []));
      } catch {
        // Une date indisponible ne doit pas masquer tout le calendrier du championnat.
      }
    }
    return { leagueId: league.id, matches };
  };
  const [standingsResults, fixtureResults] = await Promise.all([
    Promise.allSettled(
      SPORTS_LEAGUES.map((league) =>
        fetch(`https://sportscore.com/api/widget/standings/?sport=football&slug=${league.slug}`, {
          headers: SPORT_HEADERS,
          next: { revalidate: 300 },
        }).then(async (response) => {
          if (!response.ok) throw new Error(`SportScore standings HTTP ${response.status}`);
          return response.json() as Promise<StandingsResponse>;
        }),
      ),
    ),
    Promise.allSettled(SPORTS_LEAGUES.map(fetchLeagueFixtures)),
  ]);

  return SPORTS_LEAGUES.map((league, index) => {
    const leagueMatches = fixtureResults
      .flatMap((result) =>
        result.status === "fulfilled" && result.value.leagueId === league.id
          ? result.value.matches
          : [],
      )
      .filter(
        (match, matchIndex, all) =>
          match.url && all.findIndex((item) => item.url === match.url) === matchIndex,
      );
    const serializeMatch = (match: SportsMatch) => ({
      home: match.home ?? "—",
      away: match.away ?? "—",
      homeScore: match.home_score == null ? null : String(match.home_score),
      awayScore: match.away_score == null ? null : String(match.away_score),
      playedAt: match.time ?? null,
      link: match.url ? `https://sportscore.com${match.url}` : "https://sportscore.com/",
    });
    const standing = standingsResults[index];

    return {
      id: league.id,
      name: league.name,
      standings:
        standing.status === "fulfilled"
          ? (standing.value.tables?.[0]?.rows ?? []).map((row) => ({
              position: row.pos ?? 0,
              team: row.team ?? "—",
              played: row.p ?? 0,
              goalDifference: row.gd ?? 0,
              points: row.pts ?? 0,
            }))
          : [],
      results: leagueMatches
        .filter((match) => match.status === "finished")
        .sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""))
        .slice(0, 8)
        .map(serializeMatch),
      upcoming: leagueMatches
        .filter((match) => match.status === "upcoming")
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
        .slice(0, 8)
        .map(serializeMatch),
    };
  });
}

const NEWS_FEEDS = [
  { url: "https://www.france24.com/fr/rss", source: "France 24", tone: "news" },
  {
    url: "https://www.20minutes.fr/feeds/rss-sport.xml",
    source: "20 Minutes · Sport",
    tone: "sport",
  },
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
  const [weatherResult, airResult, sportsResult, ...feedResults] = await Promise.allSettled([
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
    fetchSportsDashboard(),
    ...NEWS_FEEDS.map(fetchFeed),
  ]);

  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const air = airResult.status === "fulfilled" ? airResult.value : null;
  const sportsLeagues = sportsResult.status === "fulfilled" ? sportsResult.value : [];
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
      sportsLeagues,
      headlines,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
