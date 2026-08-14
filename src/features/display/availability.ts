import type { ResourceReservation } from "./types";

export function getReservationState(reservations: ResourceReservation[], now: Date) {
  const nowTimestamp = now.getTime();
  const ordered = [...reservations].sort(
    (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
  );
  const current = ordered.find(
    (reservation) =>
      new Date(reservation.startAt).getTime() <= nowTimestamp &&
      nowTimestamp < new Date(reservation.endAt).getTime(),
  );
  const next = ordered.find(
    (reservation) => new Date(reservation.startAt).getTime() > nowTimestamp,
  );

  if (!current) return { current: null, next, availableAt: null, ordered };
  if (current.allDay) return { current, next: undefined, availableAt: null, ordered };

  let availableTimestamp = new Date(current.endAt).getTime();
  for (const reservation of ordered) {
    const startTimestamp = new Date(reservation.startAt).getTime();
    const endTimestamp = new Date(reservation.endAt).getTime();
    if (startTimestamp <= availableTimestamp && endTimestamp > availableTimestamp) {
      availableTimestamp = endTimestamp;
    }
  }

  const availableAt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(availableTimestamp));
  return { current, next: undefined, availableAt, ordered };
}
