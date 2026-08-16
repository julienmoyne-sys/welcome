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

  const orbisUrl = new URL(
    `https://api.tomtom.com/maps/orbis/traffic/tile/flow/${zoom}/${column}/${row}.png`,
  );
  orbisUrl.searchParams.set("apiVersion", "1");
  orbisUrl.searchParams.set("key", apiKey);
  orbisUrl.searchParams.set("style", "light");
  orbisUrl.searchParams.set("tileSize", "256");

  const legacyUrl = new URL(
    `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/${zoom}/${column}/${row}.png`,
  );
  legacyUrl.searchParams.set("key", apiKey);
  legacyUrl.searchParams.set("tileSize", "256");

  const upstreamStatuses: number[] = [];
  let response: Response | null = null;
  for (const tileUrl of [orbisUrl, legacyUrl]) {
    const candidate = await fetch(tileUrl, {
      headers: { Accept: "image/png, application/json" },
      next: { revalidate: 60 },
    });
    upstreamStatuses.push(candidate.status);
    if (candidate.ok && candidate.headers.get("content-type")?.includes("image/png")) {
      response = candidate;
      break;
    }
  }

  if (!response) {
    console.error("TomTom traffic tile unavailable", { upstreamStatuses, zoom });
    return NextResponse.json(
      { error: "Traffic tile unavailable", upstreamStatuses },
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
