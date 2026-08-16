import { NextResponse } from "next/server";

import { getVtcLocationPayload, parseVtcLocation } from "@/lib/vtc-location";
import { getLocationSessionRole } from "@/lib/vtc-location-auth.server";
import { canReadVtcLocation, canWriteVtcLocation } from "@/lib/vtc-location-token";
import { getLastVtcLocation, saveLastVtcLocation } from "@/lib/vtc-location-store.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!canReadVtcLocation(await getLocationSessionRole())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const location = await getLastVtcLocation();
    return NextResponse.json(getVtcLocationPayload(location), {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Service GPS indisponible" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Requête refusée" }, { status: 403 });
    }
    if (!canWriteVtcLocation(await getLocationSessionRole())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const location = parseVtcLocation(await request.json());
    if (!location) return NextResponse.json({ error: "Position invalide" }, { status: 400 });
    await saveLastVtcLocation(location);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Service GPS indisponible" }, { status: 503 });
  }
}
