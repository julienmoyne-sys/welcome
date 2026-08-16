export const VTC_LOCATION_LIVE_MS = 30_000;
export const VTC_LOCATION_STALE_MS = 120_000;

export type VtcLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

export type VtcLocationState = "live" | "stale" | "offline";

export function getVtcLocationState(timestamp: number, now = Date.now()): VtcLocationState {
  const age = Math.max(0, now - timestamp);
  if (age < VTC_LOCATION_LIVE_MS) return "live";
  if (age < VTC_LOCATION_STALE_MS) return "stale";
  return "offline";
}

export function getVtcLocationPayload(location: VtcLocation | null, now = Date.now()) {
  return location
    ? { location, state: getVtcLocationState(location.timestamp, now) }
    : { location: null, state: "offline" as const };
}

export function parseVtcLocation(value: unknown): VtcLocation | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const accuracy = Number(input.accuracy);
  const timestamp = Number(input.timestamp);
  const optionalNumber = (candidate: unknown) =>
    candidate == null || candidate === "" ? null : Number(candidate);
  const speed = optionalNumber(input.speed);
  const heading = optionalNumber(input.heading);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 100_000 ||
    !Number.isFinite(timestamp) ||
    Math.abs(Date.now() - timestamp) > 10 * 60_000 ||
    (speed !== null && (!Number.isFinite(speed) || speed < 0 || speed > 150)) ||
    (heading !== null && (!Number.isFinite(heading) || heading < 0 || heading > 360))
  )
    return null;
  return { latitude, longitude, accuracy, speed, heading, timestamp };
}
