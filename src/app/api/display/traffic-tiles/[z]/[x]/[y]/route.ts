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

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Traffic service unavailable" }, { status: 503 });
  }

  const tileUrl = new URL(
    `https://api.tomtom.com/traffic/map/4/tile/flow/relative-delay/${zoom}/${column}/${row}.png`,
  );
  tileUrl.searchParams.set("key", apiKey);
  tileUrl.searchParams.set("tileSize", "256");
  tileUrl.searchParams.set("thickness", "12");

  const response = await fetch(tileUrl, {
    headers: { Accept: "image/png, application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) {
    console.error("TomTom traffic tile unavailable", { upstreamStatus: response.status, zoom });
    return NextResponse.json(
      { error: "Traffic tile unavailable", upstreamStatus: response.status },
      { status: 502 },
    );
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      "Content-Type": "image/png",
    },
  });
}
