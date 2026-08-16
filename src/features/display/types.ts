export type DisplayEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

export type ResourceReservation = {
  id: string;
  resource: "meeting-room";
  resourceName: string;
  reservationTitle: string;
  start: string;
  end: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
};

export type DisplayEventsResponse = {
  date: string;
  events: DisplayEvent[];
  reservations: ResourceReservation[];
};

export type LiveInfoResponse = {
  updatedAt: string;
  weather: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
  } | null;
  headlines: Array<{ title: string; source: string; scope: "local" | "world" }>;
  traffic: Array<{
    id: number;
    name: string;
    status: number;
    coordinates: Array<[number, number]>;
  }>;
};

export type DisplaySlideId = "welcome" | "availability" | "website" | "live";

export type DisplaySlideConfig = {
  id: DisplaySlideId;
  enabled: boolean;
  durationMs: number;
};
