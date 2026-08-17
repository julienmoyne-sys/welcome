"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_VTC_LOCATION,
  reverseGeocodeVtcLocation,
  type VtcLocation,
} from "@/lib/vtc-location";

export function useVtcLocation() {
  const [location, setLocation] = useState<VtcLocation>(DEFAULT_VTC_LOCATION);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      window.queueMicrotask(() => setIsLocating(false));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void reverseGeocodeVtcLocation(coords.latitude, coords.longitude)
          .then(setLocation)
          .catch(() => undefined)
          .finally(() => setIsLocating(false));
      },
      () => setIsLocating(false),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  return { location, isLocating };
}
