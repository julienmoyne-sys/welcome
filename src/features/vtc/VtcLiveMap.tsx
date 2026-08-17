"use client";

import { useEffect, useRef, useState } from "react";

import { DEFAULT_VTC_LOCATION, isWithinFrenchDepartments } from "@/lib/vtc-location";

import styles from "./vtc.module.css";

export type GpsSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  city: string | null;
};

export type LocationStatus = "loading" | "ready" | "denied" | "unavailable";

export type NavigationRoute = {
  destination: { label: string; latitude: number; longitude: number };
  durationSeconds: number;
  distanceMeters: number;
  geometry: Array<[number, number]>;
};

type VtcLiveMapProps = {
  route: NavigationRoute | null;
  onPosition: (snapshot: GpsSnapshot) => void;
  onStatusChange: (status: LocationStatus) => void;
};

const FALLBACK_POSITION: [number, number] = [DEFAULT_VTC_LOCATION.lat, DEFAULT_VTC_LOCATION.lon];

export function VtcLiveMap({ route, onPosition, onStatusChange }: VtcLiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onPositionRef = useRef(onPosition);
  const onStatusChangeRef = useRef(onStatusChange);
  const [status, setStatus] = useState<LocationStatus>("loading");

  useEffect(() => {
    onPositionRef.current = onPosition;
    onStatusChangeRef.current = onStatusChange;
  }, [onPosition, onStatusChange]);

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
    let lastCityLookupPosition: [number, number] | null = null;
    let cityLookupSequence = 0;
    let currentCity: string | null = null;
    let currentAltitude: number | null = null;
    let rejectedDevicePosition: [number, number] | null = null;

    const changeStatus = (nextStatus: LocationStatus) => {
      setStatus(nextStatus);
      onStatusChangeRef.current(nextStatus);
    };

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

        const updatePosition = (position: GeolocationPosition) => {
          if (disposed || !map) return;
          const {
            latitude: deviceLatitude,
            longitude: deviceLongitude,
            accuracy,
            altitude: deviceAltitude,
            speed,
          } = position.coords;
          const deviceLatLng: [number, number] = [deviceLatitude, deviceLongitude];
          const usesDefault =
            !isWithinFrenchDepartments(deviceLatitude, deviceLongitude) ||
            Boolean(
              rejectedDevicePosition && map.distance(rejectedDevicePosition, deviceLatLng) < 10_000,
            );
          const latitude = usesDefault ? DEFAULT_VTC_LOCATION.lat : deviceLatitude;
          const longitude = usesDefault ? DEFAULT_VTC_LOCATION.lon : deviceLongitude;
          const altitude = usesDefault ? null : deviceAltitude;
          const latLng: [number, number] = [latitude, longitude];
          if (usesDefault) currentCity = DEFAULT_VTC_LOCATION.city;
          currentPosition = latLng;
          if (altitude != null) currentAltitude = altitude;

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
          changeStatus("ready");

          const snapshot = (city: string | null): GpsSnapshot => ({
            latitude,
            longitude,
            accuracy,
            altitude: currentAltitude,
            speed,
            city,
          });

          // La position peut provenir du Wi-Fi ou du réseau. Ne pas bloquer son
          // affichage pendant la résolution, plus lente, du nom de la commune.
          onPositionRef.current(snapshot(currentCity));

          const now = Date.now();
          const movedSinceLookup = lastCityLookupPosition
            ? map.distance(lastCityLookupPosition, latLng)
            : Number.POSITIVE_INFINITY;
          if (movedSinceLookup >= 500 || now - lastCityLookup > 30_000) {
            lastCityLookup = now;
            lastCityLookupPosition = latLng;
            const lookupSequence = ++cityLookupSequence;
            void fetch(`/api/vtc/commune?lat=${latitude.toFixed(5)}&lon=${longitude.toFixed(5)}`)
              .then((response) =>
                response.ok
                  ? (response.json() as Promise<{
                      city?: string | null;
                      departmentCode?: string | null;
                      altitude?: number | null;
                    }>)
                  : Promise.reject(),
              )
              .then((data) => {
                if (disposed || lookupSequence !== cityLookupSequence) return;
                if (!usesDefault && !data.departmentCode) {
                  rejectedDevicePosition = deviceLatLng;
                  currentCity = DEFAULT_VTC_LOCATION.city;
                  currentAltitude = null;
                  positionMarker?.setLatLng(FALLBACK_POSITION);
                  accuracyCircle?.setLatLng(FALLBACK_POSITION).setRadius(0);
                  map?.setView(FALLBACK_POSITION, 15, { animate: false });
                  updateRoute(L, FALLBACK_POSITION);
                  onPositionRef.current({
                    latitude: DEFAULT_VTC_LOCATION.lat,
                    longitude: DEFAULT_VTC_LOCATION.lon,
                    accuracy: 0,
                    altitude: null,
                    speed,
                    city: DEFAULT_VTC_LOCATION.city,
                  });
                  return;
                }
                currentCity = data.city ?? null;
                if (altitude == null && data.altitude != null) currentAltitude = data.altitude;
                onPositionRef.current(snapshot(currentCity));
              })
              .catch(() => undefined);
          }
        };

        if (!("geolocation" in navigator)) {
          changeStatus("unavailable");
          return;
        }

        watchId = navigator.geolocation.watchPosition(
          updatePosition,
          (error) =>
            changeStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
          { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 },
        );

        const refreshSize = () => map?.invalidateSize(false);
        window.setTimeout(refreshSize, 0);
        window.setTimeout(refreshSize, 400);
        resizeObserver = new ResizeObserver(refreshSize);
        resizeObserver.observe(containerRef.current);
      } catch {
        if (!disposed) changeStatus("unavailable");
      }
    };

    void initialize();

    return () => {
      disposed = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, [route]);

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
