import { NextResponse } from "next/server";

import { DisplayCalendarConfigurationError, getDisplayEvents } from "@/lib/google-calendar.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    return NextResponse.json(await getDisplayEvents(), {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    const configurationError = error instanceof DisplayCalendarConfigurationError;
    return NextResponse.json(
      {
        error: configurationError
          ? "Configuration Google Calendar incomplète"
          : "Service Google Calendar temporairement indisponible",
      },
      {
        status: configurationError ? 500 : 503,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
