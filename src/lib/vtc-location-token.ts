import { createHmac, timingSafeEqual } from "node:crypto";

export type VtcLocationRole = "driver" | "viewer";

export function canReadVtcLocation(role: VtcLocationRole | null) {
  return role === "driver" || role === "viewer";
}
export function canWriteVtcLocation(role: VtcLocationRole | null) {
  return role === "driver";
}

function secret() {
  const value = process.env.VTC_LOCATION_SECRET;
  if (!value || value.length < 24) throw new Error("VTC_LOCATION_SECRET manquant ou trop court");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function validSharedSecret(candidate: string) {
  const expected = Buffer.from(secret());
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function createLocationSession(role: VtcLocationRole) {
  const expiresAt = Date.now() + (role === "driver" ? 12 * 60 * 60_000 : 30 * 24 * 60 * 60_000);
  const payload = Buffer.from(JSON.stringify({ role, expiresAt })).toString("base64url");
  return { token: `${payload}.${signature(payload)}`, expiresAt };
}

export function verifyLocationSession(token: string, now = Date.now()): VtcLocationRole | null {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: VtcLocationRole;
      expiresAt?: number;
    };
    if (
      (data.role !== "driver" && data.role !== "viewer") ||
      !data.expiresAt ||
      data.expiresAt < now
    )
      return null;
    return data.role;
  } catch {
    return null;
  }
}
