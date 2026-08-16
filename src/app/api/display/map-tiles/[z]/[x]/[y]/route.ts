import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TileParams = { z: string; x: string; y: string };

export async function GET(_request: Request, context: { params: Promise<TileParams> }) {
  const { z, x, y } = await context.params;
  if (![z, x, y].every((value) => /^\d+$/.test(value))) {
    return NextResponse.json({ error: "Invalid tile coordinates" }, { status: 400 });
  }

  const zoom = Number(z);
  const column = Number(x);
  const row = Number(y);
  const limit = 2 ** zoom;
  if (zoom < 0 || zoom > 19 || column >= limit || row >= limit) {
    return NextResponse.json({ error: "Tile outside map bounds" }, { status: 400 });
  }

  const response = await fetch(`https://tile.openstreetmap.org/${zoom}/${column}/${row}.png`, {
    headers: { "User-Agent": "WelcomeDisplay/1.0 (https://www.welcome-coworking.com)" },
    next: { revalidate: 86_400 },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Map tile unavailable" }, { status: 502 });
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "Content-Type": "image/png",
    },
  });
}
