import type { ResourceReservation } from "./types";

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getParisMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

export function getReservationState(reservations: ResourceReservation[], nowMinutes: number) {
  const ordered = [...reservations].sort(
    (left, right) => timeToMinutes(left.start) - timeToMinutes(right.start),
  );
  const current = ordered.find(
    (reservation) =>
      reservation.allDay ||
      (timeToMinutes(reservation.start) <= nowMinutes &&
        nowMinutes < timeToMinutes(reservation.end)),
  );
  const next = ordered.find(
    (reservation) => !reservation.allDay && timeToMinutes(reservation.start) > nowMinutes,
  );

  if (!current) return { current: null, next, availableAt: null, ordered };
  if (current.allDay) return { current, next: undefined, availableAt: null, ordered };

  let availableAt = timeToMinutes(current.end);
  for (const reservation of ordered) {
    const start = timeToMinutes(reservation.start);
    if (start <= availableAt && timeToMinutes(reservation.end) > availableAt) {
      availableAt = timeToMinutes(reservation.end);
    }
  }

  const hours = Math.floor(availableAt / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (availableAt % 60).toString().padStart(2, "0");
  return { current, next: undefined, availableAt: `${hours}:${minutes}`, ordered };
}
