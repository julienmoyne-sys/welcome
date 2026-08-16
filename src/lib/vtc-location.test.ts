import assert from "node:assert/strict";
import test from "node:test";

import {
  clearVtcLocationWatch,
  shouldTransmitLocation,
  vtcGeolocationErrorMessage,
} from "./vtc-driver.ts";
import { getVtcLocationPayload, getVtcLocationState, parseVtcLocation } from "./vtc-location.ts";
import {
  canReadVtcLocation,
  canWriteVtcLocation,
  createLocationSession,
  validSharedSecret,
  verifyLocationSession,
} from "./vtc-location-token.ts";

process.env.VTC_LOCATION_SECRET = "test-secret-with-at-least-24-characters";

test("accepte une position valide destinée au POST", () => {
  const now = Date.now();
  assert.deepEqual(
    parseVtcLocation({
      latitude: 48.57,
      longitude: 7.75,
      accuracy: 6,
      speed: 12,
      heading: 180,
      timestamp: now,
    }),
    {
      latitude: 48.57,
      longitude: 7.75,
      accuracy: 6,
      speed: 12,
      heading: 180,
      timestamp: now,
    },
  );
});

test("rejette une position invalide", () => {
  assert.equal(
    parseVtcLocation({ latitude: 200, longitude: 7.75, accuracy: 6, timestamp: Date.now() }),
    null,
  );
});

test("calcule les états live, stale et offline", () => {
  const now = 1_000_000;
  assert.equal(getVtcLocationState(now - 10_000, now), "live");
  assert.equal(getVtcLocationState(now - 60_000, now), "stale");
  assert.equal(getVtcLocationState(now - 180_000, now), "offline");
});

test("retourne offline en l’absence de position", () => {
  assert.deepEqual(getVtcLocationPayload(null), { location: null, state: "offline" });
});

test("protège les sessions et rejette un secret incorrect", () => {
  assert.equal(validSharedSecret("mauvais-secret"), false);
  const session = createLocationSession("viewer");
  assert.equal(verifyLocationSession(session.token), "viewer");
  assert.equal(verifyLocationSession(`${session.token}corrompu`), null);
});

test("autorise le GET authentifié et réserve le POST au conducteur", () => {
  assert.equal(canReadVtcLocation(null), false);
  assert.equal(canReadVtcLocation("viewer"), true);
  assert.equal(canWriteVtcLocation("viewer"), false);
  assert.equal(canWriteVtcLocation("driver"), true);
});

test("limite les transmissions à 10 secondes ou 25 mètres", () => {
  assert.equal(shouldTransmitLocation(9_000, 10), false);
  assert.equal(shouldTransmitLocation(10_000, 10), true);
  assert.equal(shouldTransmitLocation(2_000, 30), true);
});

test("arrête watchPosition et traduit un refus de géolocalisation", () => {
  let cleared: number | null = null;
  clearVtcLocationWatch(
    {
      clearWatch: (id) => {
        cleared = id;
      },
    },
    42,
  );
  assert.equal(cleared, 42);
  assert.match(vtcGeolocationErrorMessage(1), /refusée/);
});
