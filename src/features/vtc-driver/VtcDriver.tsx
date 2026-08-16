"use client";

import { LocateFixed, Radio, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./vtc-driver.module.css";
import {
  clearVtcLocationWatch,
  shouldTransmitLocation,
  vtcGeolocationErrorMessage,
} from "@/lib/vtc-driver";

type DriverState = "inactive" | "searching" | "active" | "lost";
type SentPosition = { latitude: number; longitude: number; timestamp: number };

const labels: Record<DriverState, string> = {
  inactive: "INACTIF",
  searching: "RECHERCHE GPS",
  active: "GPS ACTIF",
  lost: "SIGNAL PERDU",
};

function distanceMeters(a: SentPosition, b: GeolocationCoordinates) {
  const lat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const lon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const value =
    Math.sin(lat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(lon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function VtcDriver() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [state, setState] = useState<DriverState>("inactive");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const watchId = useRef<number | null>(null);
  const requestInFlight = useRef(false);
  const lastSent = useRef<SentPosition | null>(null);

  const stop = useCallback(() => {
    clearVtcLocationWatch(navigator.geolocation, watchId.current);
    watchId.current = null;
    setIsWatching(false);
    requestInFlight.current = false;
    setState("inactive");
    setMessage("");
  }, []);

  useEffect(() => {
    void fetch("/api/vtc/location/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean; role?: string }) =>
        setAuthenticated(data.authenticated === true && data.role === "driver"),
      )
      .catch(() => setAuthenticated(false));
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      window.clearInterval(clock);
      clearVtcLocationWatch(navigator.geolocation, watchId.current);
    };
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation || watchId.current !== null) {
      if (!navigator.geolocation)
        setMessage("La géolocalisation n’est pas disponible sur ce téléphone.");
      return;
    }
    setState("searching");
    setMessage("Autorisez la localisation précise si le téléphone le demande.");
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { coords } = position;
        setAccuracy(coords.accuracy);
        setSpeed(coords.speed);
        const elapsed = Date.now() - (lastSent.current?.timestamp ?? 0);
        const moved = lastSent.current
          ? distanceMeters(lastSent.current, coords)
          : Number.POSITIVE_INFINITY;
        if (requestInFlight.current || !shouldTransmitLocation(elapsed, moved)) return;
        requestInFlight.current = true;
        void fetch("/api/vtc/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            speed: coords.speed,
            heading: coords.heading,
            timestamp: position.timestamp,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error();
            const sentAt = Date.now();
            lastSent.current = {
              latitude: coords.latitude,
              longitude: coords.longitude,
              timestamp: sentAt,
            };
            setLastSentAt(sentAt);
            setState("active");
            setMessage(
              coords.accuracy > 100
                ? "Précision GPS faible : placez le téléphone près d’une vitre."
                : "Position transmise en toute sécurité.",
            );
          })
          .catch(() => {
            setState("lost");
            setMessage("Transmission impossible. Vérifiez le réseau mobile.");
          })
          .finally(() => {
            requestInFlight.current = false;
          });
      },
      (error) => {
        setState("lost");
        setMessage(vtcGeolocationErrorMessage(error.code));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 3_000 },
    );
    setIsWatching(true);
  }, []);

  if (authenticated === null)
    return (
      <main className={styles.screen}>
        <span className={styles.loading}>Connexion sécurisée…</span>
      </main>
    );

  if (!authenticated)
    return (
      <main className={styles.screen}>
        <form
          className={styles.login}
          onSubmit={async (event) => {
            event.preventDefault();
            setAuthError("");
            const response = await fetch("/api/vtc/location/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ secret: accessCode, role: "driver" }),
            });
            if (response.ok) {
              setAccessCode("");
              setAuthenticated(true);
            } else setAuthError("Code d’accès incorrect ou service non configuré.");
          }}
        >
          <ShieldCheck aria-hidden="true" />
          <h1>GPS véhicule</h1>
          <p>Connexion conducteur</p>
          <input
            type="password"
            autoComplete="current-password"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="Code d’accès"
            aria-label="Code d’accès"
          />
          <button type="submit" disabled={!accessCode}>
            Se connecter
          </button>
          {authError && <small>{authError}</small>}
        </form>
      </main>
    );

  return (
    <main className={styles.screen}>
      <section className={styles.panel}>
        <header>
          <LocateFixed aria-hidden="true" />
          <span>GPS véhicule</span>
        </header>
        <div className={styles.signal} data-state={state}>
          <Radio aria-hidden="true" />
          <strong>{labels[state]}</strong>
        </div>
        <div className={styles.readings}>
          <p>
            <span>Précision</span>
            <strong>{accuracy == null ? "—" : `± ${Math.round(accuracy)} m`}</strong>
          </p>
          <p>
            <span>Dernier envoi</span>
            <strong>
              {lastSentAt == null
                ? "—"
                : `il y a ${Math.max(0, Math.round((now - lastSentAt) / 1000))} s`}
            </strong>
          </p>
          {speed != null && speed >= 0 && (
            <p>
              <span>Vitesse GPS</span>
              <strong>{Math.round(speed * 3.6)} km/h</strong>
            </p>
          )}
        </div>
        <p className={styles.message}>{message || "Prêt à transmettre la position du véhicule."}</p>
        <div className={styles.actions}>
          <button className={styles.start} type="button" onClick={start} disabled={isWatching}>
            Démarrer le GPS
          </button>
          <button className={styles.stop} type="button" onClick={stop} disabled={!isWatching}>
            Arrêter
          </button>
        </div>
      </section>
    </main>
  );
}
