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

const LOCAL_FALLBACK_VIDEOS = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi hip hop radio — musique pour se détendre",
    channel: "Lofi Girl",
  },
  {
    id: "21X5lGlDOfg",
    title: "La Terre vue depuis la Station spatiale internationale",
    channel: "NASA",
  },
  {
    id: "YE7VzlLtp-4",
    title: "Big Buck Bunny — court métrage d’animation",
    channel: "Blender Foundation",
  },
];

function localVideos(query: string) {
  if (!query) return LOCAL_FALLBACK_VIDEOS;

  const normalizedQuery = query.toLocaleLowerCase("fr");
  const matches = LOCAL_FALLBACK_VIDEOS.filter(({ title, channel }) =>
    `${title} ${channel}`.toLocaleLowerCase("fr").includes(normalizedQuery),
  );
  return matches.length ? matches : LOCAL_FALLBACK_VIDEOS;
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function GET(request: NextRequest) {
  const requestedQuery = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ videos: localVideos(requestedQuery), source: "local-fallback" });
  }

  const query = requestedQuery || DEFAULT_QUERY;
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
