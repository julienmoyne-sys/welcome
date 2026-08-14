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
  allDay: boolean;
};

export type DisplayEventsResponse = {
  date: string;
  events: DisplayEvent[];
  reservations: ResourceReservation[];
};

export type DisplaySlideId =
  "welcome" | "today" | "availability" | "services" | "practical" | "announcement" | "branding";

export type DisplaySlideConfig = {
  id: DisplaySlideId;
  enabled: boolean;
  durationMs: number;
};
