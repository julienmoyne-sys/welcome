import "server-only";

import { google, type calendar_v3 } from "googleapis";

import type {
  DisplayEvent,
  DisplayEventsResponse,
  ResourceReservation,
} from "@/features/display/types";
import { matchDisplayResource } from "@/lib/display-resources";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const DISPLAY_TIME_ZONE = "Europe/Paris";

export class DisplayCalendarConfigurationError extends Error {
  constructor() {
    super("Google Calendar configuration is incomplete");
    this.name = "DisplayCalendarConfigurationError";
  }
}

function parisDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Convertit minuit à Paris en UTC, y compris lors des changements heure été/hiver. */
function parisMidnightUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  let instant = Date.UTC(year, month - 1, day);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(instant)).map(({ type, value }) => [type, value]),
    );
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    instant += Date.UTC(year, month - 1, day) - represented;
  }

  return new Date(instant);
}

function nextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

function formatTime(dateTime: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: DISPLAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(dateTime));
}

function toDisplayEvent(event: calendar_v3.Schema$Event): DisplayEvent | null {
  if (event.status === "cancelled" || !event.id || !event.summary || !event.start) return null;

  const allDay = Boolean(event.start.date);
  if (!allDay && !event.start.dateTime) return null;

  return {
    id: event.id,
    title: event.summary,
    start: allDay ? "Toute la journée" : formatTime(event.start.dateTime!),
    end: allDay || !event.end?.dateTime ? "" : formatTime(event.end.dateTime),
    allDay,
  };
}

function toResourceReservation(event: calendar_v3.Schema$Event): ResourceReservation | null {
  if (event.status === "cancelled" || !event.id || !event.summary || !event.start) return null;
  const mapping = matchDisplayResource(event.summary);
  if (!mapping) return null;

  const allDay = Boolean(event.start.date);
  if (!allDay && (!event.start.dateTime || !event.end?.dateTime)) return null;

  return {
    id: event.id,
    resource: mapping.resource,
    resourceName: mapping.resourceName,
    reservationTitle: mapping.reservationTitle,
    start: allDay ? "00:00" : formatTime(event.start.dateTime!),
    end: allDay ? "24:00" : formatTime(event.end!.dateTime!),
    startAt: allDay ? parisMidnightUtc(event.start.date!).toISOString() : event.start.dateTime!,
    endAt: allDay ? parisMidnightUtc(event.end!.date!).toISOString() : event.end!.dateTime!,
    allDay,
  };
}

function credentials() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!calendarId || !clientEmail || !privateKey) {
    throw new DisplayCalendarConfigurationError();
  }
  return { calendarId, clientEmail, privateKey };
}

async function requestGoogleEvents(date: string): Promise<DisplayEventsResponse> {
  const { calendarId, clientEmail, privateKey } = credentials();
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [CALENDAR_SCOPE],
  });
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.list({
    calendarId,
    timeMin: parisMidnightUtc(date).toISOString(),
    timeMax: parisMidnightUtc(nextDate(date)).toISOString(),
    timeZone: DISPLAY_TIME_ZONE,
    singleEvents: true,
    orderBy: "startTime",
    showDeleted: false,
    maxResults: 50,
    fields: "items(id,summary,status,start(date,dateTime),end(date,dateTime))",
  });
  const items = response.data.items ?? [];
  const reservations = items
    .map(toResourceReservation)
    .filter((reservation): reservation is ResourceReservation => reservation !== null)
    .sort((left, right) => left.start.localeCompare(right.start));
  const events = items
    .filter((event) => !event.summary || !matchDisplayResource(event.summary))
    .map(toDisplayEvent)
    .filter((event): event is DisplayEvent => event !== null)
    .sort(
      (left, right) =>
        Number(right.allDay) - Number(left.allDay) || left.start.localeCompare(right.start),
    );
  return { date, events, reservations };
}

export async function getDisplayEvents(): Promise<DisplayEventsResponse> {
  const date = parisDate();
  try {
    return await requestGoogleEvents(date);
  } catch (error) {
    console.error("Unable to refresh public display events from Google Calendar", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    throw error;
  }
}

export function emptyDisplayEvents(): DisplayEventsResponse {
  return { date: parisDate(), events: [], reservations: [] };
}
