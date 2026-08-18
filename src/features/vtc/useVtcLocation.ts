"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_VTC_LOCATION,
  isWithinFrenchDepartments,
  reverseGeocodeVtcLocation,
  type VtcLocation,
} from "@/lib/vtc-location";

export function useVtcLocation() {
  const [location, setLocation] = useState<VtcLocation>(DEFAULT_VTC_LOCATION);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    let active = true;
    if (!("geolocation" in navigator)) {
      window.queueMicrotask(() => setIsLocating(false));
      return;
    }

    const finish = () => {
      if (active) setIsLocating(false);
    };
    const usePosition = ({ coords }: GeolocationPosition) => {
      if (!active) return;
      if (!isWithinFrenchDepartments(coords.latitude, coords.longitude)) {
        setLocation(DEFAULT_VTC_LOCATION);
        finish();
        return;
      }
      void reverseGeocodeVtcLocation(coords.latitude, coords.longitude)
        .then((nextLocation) => {
          if (active) setLocation(nextLocation);
        })
        .catch(() => undefined)
        .finally(finish);
    };
    const tryWifiLocation = () => {
      navigator.geolocation.getCurrentPosition(usePosition, finish, {
        enableHighAccuracy: false,
        timeout: 20_000,
        maximumAge: 10 * 60_000,
      });
    };

    navigator.geolocation.getCurrentPosition(usePosition, tryWifiLocation, {
      enableHighAccuracy: true,
      timeout: 8_000,
      maximumAge: 30_000,
    });

    return () => {
      active = false;
    };
  }, []);

  return { location, isLocating };
}
