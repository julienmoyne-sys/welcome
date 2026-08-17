import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_QUERY = "découverte France voyage 4K";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: { title?: string; channelTitle?: string };
  }>;
  error?: { message?: string };
};

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "La clé YouTube n'est pas configurée." }, { status: 503 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) || DEFAULT_QUERY;
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "6",
    q: query,
    key: apiKey,
    regionCode: "FR",
    relevanceLanguage: "fr",
    safeSearch: "strict",
    videoEmbeddable: "true",
    videoSyndicated: "true",
  });

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      next: { revalidate: 3600 },
    });
    const payload = (await response.json()) as YouTubeSearchResponse;
    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error?.message || "YouTube est temporairement indisponible." },
        { status: response.status },
      );
    }

    const videos = (payload.items ?? []).flatMap((item) => {
      const id = item.id?.videoId;
      if (!id) return [];
      return [
        {
          id,
          title: decodeEntities(item.snippet?.title ?? "Vidéo YouTube"),
          channel: decodeEntities(item.snippet?.channelTitle ?? "YouTube"),
        },
      ];
    });

    return NextResponse.json(
      { videos },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "Impossible de joindre YouTube." }, { status: 502 });
  }
}
