"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./display.module.css";

export function TrafficMap() {
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
        map.createPane("trafficFlowPane");
        const trafficFlowPane = map.getPane("trafficFlowPane");
        if (trafficFlowPane) {
          trafficFlowPane.style.zIndex = "350";
          trafficFlowPane.style.pointerEvents = "none";
        }
        L.tileLayer("/api/display/map-tiles/{z}/{x}/{y}", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);
        const mapWidth = containerRef.current.clientWidth;
        const mapHeight = containerRef.current.clientHeight;
        const density = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const trafficThickness = Math.max(
          4,
          Math.min(7, Math.round(Math.min(mapWidth / 150, mapHeight / 90) / Math.sqrt(density))),
        );
        L.tileLayer(`/api/display/traffic-tiles/{z}/{x}/{y}?thickness=${trafficThickness}`, {
          attribution: "Traffic © TomTom",
          maxZoom: 19,
          opacity: 1,
          pane: "trafficFlowPane",
        }).addTo(map);

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
            [48.545, 7.65],
            [48.63, 7.805],
          ],
          { animate: false, padding: [16, 16] },
        );

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
  }, []);

  return (
    <div className={styles.trafficMapFrame} ref={containerRef}>
      {loadFailed ? (
        <span className={styles.mapUnavailable}>Carte temporairement indisponible</span>
      ) : null}
    </div>
  );
}
