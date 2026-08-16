import { Redis } from "@upstash/redis";

import type { VtcLocation } from "./vtc-location";

const LOCATION_KEY = "welcome:vtc:last-location";
let redis: Redis | null = null;

function getRedis() {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

export async function saveLastVtcLocation(location: VtcLocation) {
  await getRedis().set(LOCATION_KEY, location);
}

export async function getLastVtcLocation() {
  return getRedis().get<VtcLocation>(LOCATION_KEY);
}
