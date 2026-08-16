export function shouldTransmitLocation(elapsedMs: number, movedMeters: number) {
  return elapsedMs >= 10_000 || movedMeters >= 25;
}

export function clearVtcLocationWatch(
  geolocation: Pick<Geolocation, "clearWatch">,
  watchId: number | null,
) {
  if (watchId !== null) geolocation.clearWatch(watchId);
}

export function vtcGeolocationErrorMessage(code: number) {
  if (code === 1) return "Autorisation GPS refusée dans les réglages du navigateur.";
  if (code === 3) return "Le GPS met trop de temps à répondre.";
  return "Signal GPS indisponible.";
}
