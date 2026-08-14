import type { ResourceReservation } from "@/features/display/types";

const RESOURCE_MARKERS = [
  { marker: "[Link]", resource: "meeting-room", resourceName: "Salle de réunion" },
] as const satisfies ReadonlyArray<{
  marker: string;
  resource: ResourceReservation["resource"];
  resourceName: string;
}>;

export function matchDisplayResource(summary: string) {
  const mapping = RESOURCE_MARKERS.find(({ marker }) => summary.startsWith(marker));
  if (!mapping) return null;
  return {
    ...mapping,
    reservationTitle: summary.slice(mapping.marker.length).trimStart() || "Réservation",
  };
}
