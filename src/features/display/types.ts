export type DisplayEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

export type DisplayEventsResponse = {
  date: string;
  events: DisplayEvent[];
};

export type DisplaySlideId =
  "welcome" | "today" | "services" | "practical" | "announcement" | "branding";

export type DisplaySlideConfig = {
  id: DisplaySlideId;
  enabled: boolean;
  durationMs: number;
};
