"use client";

import { useEffect, useRef } from "react";

import styles from "./display.module.css";
import type { LiveInfoResponse } from "./types";

const STATUS_COLORS = ["#75807d", "#54bd78", "#e0b84f", "#df756b"] as const;

export function TrafficMap({ segments }: { segments: LiveInfoResponse["traffic"] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let map: import("leaflet").Map | null = null;

    void import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, {
        attributionControl: true,
        dragging: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        zoomControl: false,
        keyboard: false,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      for (const segment of segments) {
        L.polyline(
          segment.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]),
          {
            color: STATUS_COLORS[Math.min(segment.status, 3)],
            weight: 4,
            opacity: segment.status === 0 ? 0.45 : 0.95,
            lineCap: "round",
            lineJoin: "round",
          },
        ).addTo(map);
      }

      L.circleMarker([48.5572, 7.74742], {
        radius: 8,
        color: "#d4bf63",
        weight: 3,
        fillColor: "#ffffff",
        fillOpacity: 1,
      })
        .bindTooltip("<strong>Vous êtes ICI</strong>", {
          permanent: true,
          direction: "right",
          offset: [10, 0],
          className: styles.locationTooltip,
        })
        .addTo(map);

      map.fitBounds(
        [
          [48.5415, 7.6933],
          [48.6235, 7.8067],
        ],
        { animate: false, padding: [4, 4] },
      );
      window.setTimeout(() => map?.invalidateSize(false), 0);
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [segments]);

  return <div className={styles.trafficMapFrame} ref={containerRef} />;
}
