"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./vtc.module.css";

export type GpsSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  city: string | null;
};

export type NavigationRoute = {
  destination: { label: string; latitude: number; longitude: number };
  durationSeconds: number;
  distanceMeters: number;
  geometry: Array<[number, number]>;
};

type VtcLiveMapProps = {
  route: NavigationRoute | null;
  onPosition: (snapshot: GpsSnapshot) => void;
  externalPosition?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    timestamp: number;
  } | null;
};

const FALLBACK_POSITION: [number, number] = [48.5734, 7.7521];

export function VtcLiveMap({ route, onPosition, externalPosition }: VtcLiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onPositionRef = useRef(onPosition);
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "unavailable">("loading");

  useEffect(() => {
    onPositionRef.current = onPosition;
  }, [onPosition]);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let map: import("leaflet").Map | null = null;
    let positionMarker: import("leaflet").Marker | null = null;
    let accuracyCircle: import("leaflet").Circle | null = null;
    let routeLine: import("leaflet").Polyline | null = null;
    let destinationMarker: import("leaflet").CircleMarker | null = null;
    let watchId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let currentPosition: [number, number] | null = null;
    let lastCityLookup = 0;
    let currentCity: string | null = null;

    const updateRoute = (L: typeof import("leaflet"), position: [number, number]) => {
      routeLine?.remove();
      destinationMarker?.remove();
      routeLine = null;
      destinationMarker = null;
      if (!route) return;

      const target: [number, number] = [route.destination.latitude, route.destination.longitude];
      routeLine = L.polyline(route.geometry, {
        color: "#d4bf63",
        weight: 6,
        opacity: 0.95,
        lineJoin: "round",
      }).addTo(map!);
      destinationMarker = L.circleMarker(target, {
        radius: 8,
        color: "#d4bf63",
        weight: 3,
        fillColor: "#111212",
        fillOpacity: 1,
      })
        .bindTooltip(route.destination.label, {
          permanent: true,
          direction: "right",
          offset: [10, 0],
        })
        .addTo(map!);
      map?.fitBounds([position, target], { animate: true, padding: [56, 56], maxZoom: 14 });
    };

    const initialize = async () => {
      try {
        const leafletModule = await import("leaflet");
        const L = leafletModule.default;
        if (disposed || !containerRef.current) return;

        map = L.map(containerRef.current, {
          attributionControl: true,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
        }).setView(FALLBACK_POSITION, 13);

        L.tileLayer("/api/display/map-tiles/{z}/{x}/{y}", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        const positionIcon = L.divIcon({
          className: styles.livePositionIcon,
          html: `<span class="${styles.livePositionPulse}"></span><span class="${styles.livePositionCore}"></span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const updatePosition = async (position: GeolocationPosition) => {
          if (disposed || !map) return;
          const { latitude, longitude, accuracy, altitude, speed } = position.coords;
          const latLng: [number, number] = [latitude, longitude];
          currentPosition = latLng;

          if (!positionMarker) {
            positionMarker = L.marker(latLng, { icon: positionIcon, zIndexOffset: 1000 })
              .bindTooltip("Vous êtes ici", {
                permanent: true,
                direction: "right",
                offset: [16, 0],
                className: styles.liveLocationTooltip,
              })
              .addTo(map);
            accuracyCircle = L.circle(latLng, {
              radius: accuracy,
              color: "#d4bf63",
              weight: 1,
              fillColor: "#d4bf63",
              fillOpacity: 0.08,
            }).addTo(map);
            map.setView(latLng, 15, { animate: false });
          } else {
            positionMarker.setLatLng(latLng);
            accuracyCircle?.setLatLng(latLng).setRadius(accuracy);
            map.panTo(latLng, { animate: true, duration: 0.8 });
          }

          updateRoute(L, latLng);
          setStatus("ready");

          const now = Date.now();
          if (now - lastCityLookup > 5 * 60_000) {
            lastCityLookup = now;
            try {
              const response = await fetch(
                `/api/vtc/commune?lat=${latitude.toFixed(5)}&lon=${longitude.toFixed(5)}`,
              );
              if (response.ok) {
                const data = (await response.json()) as { city?: string | null };
                currentCity = data.city ?? null;
              }
            } catch {
              currentCity = null;
            }
          }

          onPositionRef.current({
            latitude,
            longitude,
            accuracy,
            altitude,
            speed,
            city: currentCity,
          });
        };

        if (externalPosition) {
          await updatePosition({
            coords: {
              ...externalPosition,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              toJSON: () => ({}),
            },
            timestamp: externalPosition.timestamp,
            toJSON: () => ({}),
          });
        } else if (externalPosition === null || !("geolocation" in navigator)) {
          setStatus("unavailable");
          return;
        } else {
          watchId = navigator.geolocation.watchPosition(
            (position) => void updatePosition(position),
            (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
            { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
          );
        }

        const refreshSize = () => map?.invalidateSize(false);
        window.setTimeout(refreshSize, 0);
        window.setTimeout(refreshSize, 400);
        resizeObserver = new ResizeObserver(refreshSize);
        resizeObserver.observe(containerRef.current);
      } catch {
        if (!disposed) setStatus("unavailable");
      }
    };

    void initialize();

    return () => {
      disposed = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, [route, externalPosition]);

  return (
    <section className={styles.cockpitMap} aria-label="Carte GPS en temps réel">
      <div ref={containerRef} className={styles.liveMapCanvas} />
      <div className={styles.liveMapStatus} data-status={status}>
        {status === "loading" && "Recherche de la position GPS…"}
        {status === "denied" && "Autorisez la localisation pour afficher la voiture."}
        {status === "unavailable" && "Position GPS temporairement indisponible."}
      </div>
    </section>
  );
}
