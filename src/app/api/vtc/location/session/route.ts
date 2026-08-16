import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createLocationSession,
  getLocationSessionRole,
  validSharedSecret,
  VTC_LOCATION_COOKIE,
  type VtcLocationRole,
} from "@/lib/vtc-location-auth.server";

export const runtime = "nodejs";

export async function GET() {
  const role = await getLocationSessionRole();
  return NextResponse.json(
    { authenticated: Boolean(role), role },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { secret?: string; role?: VtcLocationRole };
    if (
      (body.role !== "driver" && body.role !== "viewer") ||
      !body.secret ||
      !validSharedSecret(body.secret)
    ) {
      return NextResponse.json({ error: "Code d’accès invalide" }, { status: 401 });
    }
    const session = createLocationSession(body.role);
    (await cookies()).set(VTC_LOCATION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return NextResponse.json({ authenticated: true, role: body.role });
  } catch {
    return NextResponse.json({ error: "Service GPS non configuré" }, { status: 503 });
  }
}

export async function DELETE() {
  (await cookies()).delete(VTC_LOCATION_COOKIE);
  return new NextResponse(null, { status: 204 });
}
