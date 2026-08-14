import { NextResponse } from "next/server";

import { DisplayCalendarConfigurationError, getDisplayEvents } from "@/lib/google-calendar.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getDisplayEvents(), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
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
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
