import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WikipediaSummary = {
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim();
  if (!city || city.length > 100) {
    return NextResponse.json({ error: "Ville invalide" }, { status: 400 });
  }

  try {
    const summaryResponse = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`,
      {
        headers: { "User-Agent": "WelcomeVTC/1.0 (city illustration)" },
        next: { revalidate: 86_400 },
      },
    );
    if (!summaryResponse.ok) throw new Error("Ville introuvable");

    const summary = (await summaryResponse.json()) as WikipediaSummary;
    const imageUrl = summary.originalimage?.source ?? summary.thumbnail?.source;
    if (!imageUrl) throw new Error("Photo indisponible");

    const parsedImageUrl = new URL(imageUrl);
    if (parsedImageUrl.hostname !== "upload.wikimedia.org") throw new Error("Source invalide");

    const imageResponse = await fetch(parsedImageUrl, { next: { revalidate: 86_400 } });
    if (!imageResponse.ok || !imageResponse.body) throw new Error("Photo indisponible");

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo indisponible" }, { status: 404 });
  }
}
