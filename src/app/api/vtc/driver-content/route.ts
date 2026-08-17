import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

import { DEMO_DRIVER_CONTENT, type DriverContent } from "@/lib/driver-content";

type DriverRow = { id: string; display_name: string };
type ContentRow = {
  id: string;
  kind: "service" | "favorite";
  title: string;
  description: string;
  address: string | null;
  price_cents: number | null;
  currency: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestedSlug = new URL(request.url).searchParams.get("driver")?.trim();
  const slug = requestedSlug || process.env.VTC_DRIVER_SLUG || "demo";
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) return NextResponse.json(DEMO_DRIVER_CONTENT);

  try {
    const sql = neon(databaseUrl);
    const drivers = (await sql`
      SELECT id, display_name
      FROM vtc_drivers
      WHERE slug = ${slug} AND is_active = true
      LIMIT 1
    `) as DriverRow[];
    const driver = drivers[0];
    if (!driver) return NextResponse.json(DEMO_DRIVER_CONTENT);

    const items = (await sql`
      SELECT id, kind, title, description, address, price_cents, currency
      FROM vtc_driver_content
      WHERE driver_id = ${driver.id} AND is_visible = true
      ORDER BY kind, display_order, created_at
    `) as ContentRow[];

    const content: DriverContent = {
      driver: { id: driver.id, displayName: driver.display_name },
      services: items
        .filter((item) => item.kind === "service")
        .map(({ id, title, description, price_cents, currency }) => ({
          id,
          title,
          description,
          priceCents: price_cents,
          currency,
        })),
      favorites: items
        .filter((item) => item.kind === "favorite")
        .map(({ id, title, description, address }) => ({ id, title, description, address })),
      source: "database",
    };
    return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load VTC driver content", error);
    return NextResponse.json(DEMO_DRIVER_CONTENT);
  }
}
