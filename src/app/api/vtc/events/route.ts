import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

type UnknownRecord = Record<string, unknown>;

export type VtcEvent = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  distanceKm: number | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  image: string | null;
  category: string | null;
  sourceUrl: string | null;
};

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : null;

function deepValues(value: unknown, key: string): unknown[] {
  const record = asRecord(value);
  if (!record) return [];
  return Object.entries(record).flatMap(([entryKey, entryValue]) => [
    ...(entryKey === key ? [entryValue] : []),
    ...(Array.isArray(entryValue)
      ? entryValue.flatMap((item) => deepValues(item, key))
      : deepValues(entryValue, key)),
  ]);
}

function firstString(value: unknown, keys: string[]): string | null {
  for (const key of keys) {
    const candidate = deepValues(value, key).flatMap((item) =>
      Array.isArray(item) ? item : [item],
    )[0];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

function firstNumber(value: unknown, keys: string[]): number | null {
  const candidate = firstString(value, keys);
  if (candidate !== null && Number.isFinite(Number(candidate))) return Number(candidate);
  for (const key of keys) {
    const number = deepValues(value, key).find((item) => typeof item === "number");
    if (typeof number === "number") return number;
  }
  return null;
}

function distanceKm(lat1: number, lon1: number, lat2: number | null, lon2: number | null) {
  if (lat2 === null || lon2 === null) return null;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function normalizeEvent(item: unknown, lat: number, lon: number): VtcEvent {
  const startDateTime = firstString(item, ["startDate", "startDateTime"]);
  const endDateTime = firstString(item, ["endDate", "endDateTime"]);
  const eventLat = firstNumber(item, ["latitude"]);
  const eventLon = firstNumber(item, ["longitude"]);
  return {
    id: firstString(item, ["uuid", "identifier", "uri"]) ?? crypto.randomUUID(),
    title: firstString(item, ["label", "title"]) ?? "Événement local",
    description: firstString(item, ["shortDescription", "description", "comment"]),
    city: firstString(item, ["addressLocality", "hasAddressCity"]),
    distanceKm: distanceKm(lat, lon, eventLat, eventLon),
    startDate: startDateTime?.slice(0, 10) ?? null,
    endDate: endDateTime?.slice(0, 10) ?? null,
    startTime: startDateTime?.includes("T") ? startDateTime.slice(11, 16) : null,
    image: firstString(item, ["thumbnail", "ebucoreLocator", "url"]),
    category: firstString(item, ["type", "label"]),
    sourceUrl: firstString(item, ["homepage", "uri"]),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const radius = Math.min(100, Math.max(1, Number(url.searchParams.get("radius")) || 30));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json({ events: [] }, { status: 400 });
  }

  const apiKey = process.env.DATATOURISME_API_KEY;
  if (!apiKey) return NextResponse.json({ events: [] });

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    geo_distance: `${lat},${lon},${radius}km`,
    start: today,
    end: sevenDaysFromNow,
    lang: "fr",
    page_size: "20",
  });

  try {
    const response = await fetch(`https://api.datatourisme.fr/v1/entertainmentAndEvent?${params}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("upstream-error");
    const data = (await response.json()) as { objects?: unknown[] };
    const events = (data.objects ?? [])
      .map((item) => normalizeEvent(item, lat, lon))
      .filter(
        (event) =>
          (!event.endDate || event.endDate >= today) &&
          (!event.startDate || event.startDate <= sevenDaysFromNow),
      )
      .sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999"))
      .slice(0, 20);
    return NextResponse.json(
      { events },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { events: [] },
      { headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  }
}
