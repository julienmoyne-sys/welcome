import { cookies } from "next/headers";

import { verifyLocationSession } from "./vtc-location-token";

export {
  createLocationSession,
  validSharedSecret,
  type VtcLocationRole,
} from "./vtc-location-token";

export const VTC_LOCATION_COOKIE = "welcome-vtc-location-session";

export async function getLocationSessionRole() {
  const token = (await cookies()).get(VTC_LOCATION_COOKIE)?.value;
  return token ? verifyLocationSession(token) : null;
}
