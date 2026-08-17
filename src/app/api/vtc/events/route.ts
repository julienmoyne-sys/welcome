import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800;

type UnknownRecord = Record<string, unknown>;
type Agenda = { uid: string; title: string; slug: string; official: boolean };

export type VtcEvent = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  department: string | null;
  distanceKm: number | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  category: string;
  sourceUrl: string | null;
};

const OPENAGENDA_API = "https://api.openagenda.com/v2";
const NATIONAL_CULTURE_AGENDA: Agenda = {
  uid: "86244142",
  title: "Ministère de la culture - événements nationaux",
  slug: "culture",
  official: true,
};

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : null;

function localizedString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  const record = asRecord(value);
  for (const language of ["fr", "en", "de"]) {
    const translated = record?.[language];
    if (typeof translated === "string" && translated.trim()) return translated.trim();
  }
  return null;
}

function cleanText(value: unknown) {
  const text = localizedString(value);
  if (!text) return null;
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: unknown, lon2: unknown) {
  const latitude = Number(lat2);
  const longitude = Number(lon2);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const dLat = radians(latitude - lat1);
  const dLon = radians(longitude - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function parisDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeCategory(event: UnknownRecord) {
  const keywords = Array.isArray(event.keywords)
    ? event.keywords.find((value) => typeof value === "string")
    : null;
  const tags = Array.isArray(event.tags)
    ? event.tags
        .map((tag) => localizedString(asRecord(tag)?.label) ?? localizedString(tag))
        .find(Boolean)
    : null;
  return cleanText(event.category) ?? cleanText(tags) ?? cleanText(keywords) ?? "Sortie";
}

function normalizeEvent(
  value: unknown,
  agenda: Agenda,
  lat: number,
  lon: number,
  rangeStart: string,
): VtcEvent | null {
  const event = asRecord(value);
  if (!event) return null;
  const location = asRecord(event.location);
  const timings = Array.isArray(event.timings) ? event.timings : [];
  const timing =
    timings.map(asRecord).find((item) => {
      const end = localizedString(item?.end) ?? localizedString(item?.begin);
      return end !== null && end.slice(0, 10) >= rangeStart;
    }) ?? asRecord(timings[0]);
  const begin = localizedString(timing?.begin) ?? localizedString(event.firstTiming);
  const finish = localizedString(timing?.end) ?? localizedString(event.lastTiming);
  if (!begin?.match(/^\d{4}-\d{2}-\d{2}/)) return null;

  const slug = localizedString(event.slug);
  const uid = localizedString(event.uid) ?? String(event.uid ?? "");
  const sourceUrl =
    localizedString(event.canonicalUrl) ??
    (slug ? `https://openagenda.com/fr/${agenda.slug}/events/${slug}` : null);

  return {
    id: `${agenda.uid}-${uid || slug || crypto.randomUUID()}`,
    title: cleanText(event.title) ?? "Événement local",
    description: cleanText(event.description) ?? cleanText(event.longDescription),
    city: cleanText(location?.city) ?? cleanText(location?.adminLevel4),
    department: cleanText(location?.department) ?? cleanText(location?.adminLevel2),
    distanceKm: distanceKm(lat, lon, location?.latitude, location?.longitude),
    startDate: begin.slice(0, 10),
    endDate: finish?.slice(0, 10) ?? null,
    startTime: begin.includes("T") ? begin.slice(11, 16) : null,
    category: normalizeCategory(event),
    sourceUrl,
  };
}

function toAgenda(value: unknown): Agenda | null {
  const agenda = asRecord(value);
  if (!agenda) return null;
  const uid = String(agenda.uid ?? "");
  const title = localizedString(agenda.title);
  const slug = localizedString(agenda.slug);
  if (!uid || !title || !slug) return null;
  return { uid, title, slug, official: agenda.official === true };
}

function rankAgendas(agendas: Agenda[], territory: string) {
  const target = normalize(territory);
  return agendas
    .map((agenda) => {
      const title = normalize(agenda.title);
      const score =
        (title === target ? 100 : title.includes(target) ? 50 : 0) +
        (/agenda|culture|sortir|evenement/.test(title) ? 20 : 0) +
        (agenda.official ? 10 : 0);
      return { agenda, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ agenda }) => agenda);
}

async function discoverAgendas(search: string, apiKey: string) {
  const params = new URLSearchParams({ search, size: "30", key: apiKey });
  const response = await fetch(`${OPENAGENDA_API}/agendas?${params}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`OpenAgenda agendas ${response.status}`);
  const payload = (await response.json()) as { agendas?: unknown[] };
  return rankAgendas(
    (payload.agendas ?? []).map(toAgenda).filter((item): item is Agenda => item !== null),
    search,
  );
}

function geographicBox(lat: number, lon: number, radius: number) {
  const latitudeDelta = radius / 111;
  const longitudeDelta = radius / (111 * Math.max(0.2, Math.cos(radians(lat))));
  return {
    northEastLat: lat + latitudeDelta,
    northEastLng: lon + longitudeDelta,
    southWestLat: lat - latitudeDelta,
    southWestLng: lon - longitudeDelta,
  };
}

async function loadAgendaEvents({
  agenda,
  apiKey,
  lat,
  lon,
  radius,
  department,
  region,
  scope,
  rangeStart,
  rangeEnd,
}: {
  agenda: Agenda;
  apiKey: string;
  lat: number;
  lon: number;
  radius: number;
  department: string;
  region: string;
  scope: "department" | "region";
  rangeStart: string;
  rangeEnd: string;
}) {
  const box = geographicBox(lat, lon, radius);
  const params = new URLSearchParams({
    key: apiKey,
    size: "100",
    detailed: "1",
    "relative[]": "current",
    "timings[gte]": `${rangeStart}T00:00:00.000Z`,
    "timings[lte]": `${rangeEnd}T23:59:59.999Z`,
    "geo[northEast][lat]": String(box.northEastLat),
    "geo[northEast][lng]": String(box.northEastLng),
    "geo[southWest][lat]": String(box.southWestLat),
    "geo[southWest][lng]": String(box.southWestLng),
  });
  params.append("relative[]", "upcoming");
  params.append(
    scope === "department" ? "adminLevel2[]" : "adminLevel1[]",
    scope === "department" ? department : region,
  );

  const response = await fetch(`${OPENAGENDA_API}/agendas/${agenda.uid}/events?${params}`, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as { events?: unknown[] };
  return (payload.events ?? [])
    .map((event) => normalizeEvent(event, agenda, lat, lon, rangeStart))
    .filter((event): event is VtcEvent => event !== null);
}

async function eventsForScope({
  territory,
  scope,
  ...options
}: Omit<Parameters<typeof loadAgendaEvents>[0], "agenda" | "scope"> & {
  territory: string;
  scope: "department" | "region";
}) {
  const discovered = await discoverAgendas(territory, options.apiKey);
  const agendas = [
    ...discovered,
    ...(discovered.some((agenda) => agenda.uid === NATIONAL_CULTURE_AGENDA.uid)
      ? []
      : [NATIONAL_CULTURE_AGENDA]),
  ].slice(0, 9);
  const results = await Promise.all(
    agendas.map((agenda) => loadAgendaEvents({ ...options, agenda, scope })),
  );
  return results.flat();
}

function deduplicate(events: VtcEvent[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = `${normalize(event.title)}|${event.startDate}|${normalize(event.city ?? "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const department = url.searchParams.get("department")?.trim() ?? "";
  const region = url.searchParams.get("region")?.trim() ?? "";
  const radius = Math.min(100, Math.max(1, Number(url.searchParams.get("radius")) || 100));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180 ||
    !department ||
    !region
  ) {
    return NextResponse.json({ events: [], status: "invalid-request" }, { status: 400 });
  }

  const apiKey = process.env.OPENAGENDA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ events: [], categories: [], status: "not-configured" });
  }

  const rangeStart = parisDate(new Date());
  const rangeEndDate = new Date();
  rangeEndDate.setUTCDate(rangeEndDate.getUTCDate() + 6);
  const rangeEnd = parisDate(rangeEndDate);
  const common = {
    apiKey,
    lat,
    lon,
    radius,
    department,
    region,
    rangeStart,
    rangeEnd,
  };

  try {
    let scope: "department" | "region" = "department";
    let events = await eventsForScope({
      ...common,
      territory: department,
      scope,
    });
    if (events.length === 0) {
      scope = "region";
      events = await eventsForScope({
        ...common,
        territory: region,
        scope,
      });
    }

    events = deduplicate(events)
      .filter(
        (event) =>
          (event.distanceKm === null || event.distanceKm <= radius) &&
          event.startDate <= rangeEnd &&
          (!event.endDate || event.endDate >= rangeStart),
      )
      .sort((a, b) =>
        a.startDate === b.startDate
          ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
          : a.startDate.localeCompare(b.startDate),
      )
      .slice(0, 60);
    const categories = [...new Set(events.map((event) => event.category))].sort((a, b) =>
      a.localeCompare(b, "fr"),
    );

    return NextResponse.json(
      {
        events,
        categories,
        status: "ready",
        scope,
        rangeStart,
        rangeEnd,
        radius,
        source: "OpenAgenda",
      },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Unable to load OpenAgenda events", error);
    return NextResponse.json(
      { events: [], categories: [], status: "upstream-error" },
      { status: 502, headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  }
}
