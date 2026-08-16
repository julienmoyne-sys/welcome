import { NextResponse } from "next/server";

import { getLiveInfo } from "@/lib/live-info.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await getLiveInfo(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { error: "Informations en direct temporairement indisponibles" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
