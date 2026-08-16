"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./display.module.css";
import type { LiveInfoResponse } from "./types";

const STATUS_COLORS = ["#75807d", "#54bd78", "#e0b84f", "#df756b"] as const;

export function TrafficMap({ segments }: { segments: LiveInfoResponse["traffic"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let map: import("leaflet").Map | null = null;

    let resizeObserver: ResizeObserver | null = null;
    let sizePolling: number | null = null;

    const initialize = async () => {
      try {
        const leafletModule = await import("leaflet");
        const L = leafletModule.default;
        if (disposed || !containerRef.current) return;
        map = L.map(containerRef.current, {
          attributionControl: true,
          dragging: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          zoomControl: false,
          zoomSnap: 0.01,
          keyboard: false,
        });
        L.tileLayer("/api/display/map-tiles/{z}/{x}/{y}", {
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

        map.setView([48.5734, 7.7521], 13.53, { animate: false });

        const refreshSize = () => {
          const container = containerRef.current;
          if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            map?.invalidateSize(false);
          }
        };
        window.setTimeout(refreshSize, 0);
        window.setTimeout(refreshSize, 350);
        window.setTimeout(refreshSize, 1_200);
        if ("ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(refreshSize);
          resizeObserver.observe(containerRef.current);
        }
        sizePolling = window.setInterval(refreshSize, 2_000);
        setLoadFailed(false);
      } catch {
        if (!disposed) setLoadFailed(true);
      }
    };

    void initialize();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (sizePolling !== null) window.clearInterval(sizePolling);
      map?.remove();
    };
  }, [segments]);

  return (
    <div className={styles.trafficMapFrame} ref={containerRef}>
      {loadFailed ? (
        <span className={styles.mapUnavailable}>Carte temporairement indisponible</span>
      ) : null}
    </div>
  );
}
