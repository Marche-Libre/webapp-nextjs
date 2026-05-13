export type MediaEmbedProvider =
  | "soundcloud"
  | "spotify"
  | "deezer"
  | "youtube"
  | "dailymotion";

export type MediaEmbedKind = "audio" | "video";

export type MediaEmbed = {
  provider: MediaEmbedProvider;
  kind: MediaEmbedKind;
  title: string;
  embedUrl: string;
  aspectRatio: "16 / 9" | "100%";
  height: number;
};

const SPOTIFY_EMBED_TYPES = new Set([
  "album",
  "artist",
  "episode",
  "playlist",
  "show",
  "track",
]);
const DEEZER_EMBED_TYPES = new Set(["album", "artist", "episode", "playlist", "track"]);
const LOCALE_PATH_SEGMENT_REGEX = /^(?:intl-[a-z]{2}|[a-z]{2}(?:-[a-z]{2})?)$/i;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);
const DAILYMOTION_HOSTS = new Set(["dailymotion.com", "www.dailymotion.com", "dai.ly"]);

export function resolveMediaEmbed(inputUrl: string | null): MediaEmbed | null {
  if (!inputUrl) return null;

  let url: URL;

  try {
    url = new URL(inputUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  return (
    resolveYouTubeEmbed(url) ??
    resolveDailymotionEmbed(url) ??
    resolveSpotifyEmbed(url) ??
    resolveDeezerEmbed(url) ??
    resolveSoundCloudEmbed(url)
  );
}

function resolveYouTubeEmbed(url: URL): MediaEmbed | null {
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  const start = getYouTubeStartSeconds(url);
  if (start) embedUrl.searchParams.set("start", String(start));

  return {
    provider: "youtube",
    kind: "video",
    title: "YouTube",
    embedUrl: embedUrl.toString(),
    aspectRatio: "16 / 9",
    height: 315,
  };
}

function resolveDailymotionEmbed(url: URL): MediaEmbed | null {
  if (!DAILYMOTION_HOSTS.has(url.hostname.toLowerCase())) return null;

  const videoId = getDailymotionVideoId(url);
  if (!videoId) return null;

  return {
    provider: "dailymotion",
    kind: "video",
    title: "Dailymotion",
    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
    aspectRatio: "16 / 9",
    height: 315,
  };
}

function resolveSpotifyEmbed(url: URL): MediaEmbed | null {
  if (url.hostname.toLowerCase() !== "open.spotify.com") return null;

  const [type, id] = getTypedMediaPath(url, SPOTIFY_EMBED_TYPES);
  if (!type || !id || !SPOTIFY_EMBED_TYPES.has(type)) return null;

  return {
    provider: "spotify",
    kind: "audio",
    title: "Spotify",
    embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
    aspectRatio: "100%",
    height: type === "track" || type === "episode" ? 152 : 352,
  };
}

function resolveDeezerEmbed(url: URL): MediaEmbed | null {
  const hostname = url.hostname.toLowerCase();
  if (hostname !== "www.deezer.com" && hostname !== "deezer.com") return null;

  const [type, id] = getTypedMediaPath(url, DEEZER_EMBED_TYPES);
  if (!type || !id || !DEEZER_EMBED_TYPES.has(type)) return null;

  return {
    provider: "deezer",
    kind: "audio",
    title: "Deezer",
    embedUrl: `https://widget.deezer.com/widget/dark/${type}/${id}`,
    aspectRatio: "100%",
    height: 300,
  };
}

function resolveSoundCloudEmbed(url: URL): MediaEmbed | null {
  const hostname = url.hostname.toLowerCase();
  if (hostname !== "soundcloud.com" && hostname !== "www.soundcloud.com") return null;
  if (getCleanPathSegments(url).length === 0) return null;

  const embedUrl = new URL("https://w.soundcloud.com/player/");
  embedUrl.searchParams.set("url", getPublicUrl(url));
  embedUrl.searchParams.set("color", "#2563eb");
  embedUrl.searchParams.set("auto_play", "false");
  embedUrl.searchParams.set("hide_related", "false");
  embedUrl.searchParams.set("show_comments", "false");
  embedUrl.searchParams.set("show_user", "true");
  embedUrl.searchParams.set("show_reposts", "false");
  embedUrl.searchParams.set("show_teaser", "true");

  return {
    provider: "soundcloud",
    kind: "audio",
    title: "SoundCloud",
    embedUrl: embedUrl.toString(),
    aspectRatio: "100%",
    height: 166,
  };
}

function getCleanPathSegments(url: URL) {
  return url.pathname.split("/").filter(Boolean);
}

function getTypedMediaPath(url: URL, supportedTypes: Set<string>) {
  const segments = getCleanPathSegments(url);
  const [first, second, third] = segments;

  if (first && supportedTypes.has(first)) return [first, second ?? null] as const;
  if (first && LOCALE_PATH_SEGMENT_REGEX.test(first) && second && supportedTypes.has(second)) {
    return [second, third ?? null] as const;
  }

  return [null, null] as const;
}

function getPublicUrl(url: URL) {
  const publicUrl = new URL(url.toString());
  publicUrl.hash = "";
  return publicUrl.toString();
}

function getYouTubeVideoId(url: URL) {
  const hostname = url.hostname.toLowerCase();
  const segments = getCleanPathSegments(url);

  if (hostname === "youtu.be") return sanitizeProviderId(segments[0]);
  if (segments[0] === "watch") return sanitizeProviderId(url.searchParams.get("v"));
  if (segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live") {
    return sanitizeProviderId(segments[1]);
  }

  return null;
}

function getYouTubeStartSeconds(url: URL) {
  const start = url.searchParams.get("start");
  if (start) return parsePositiveInteger(start);

  const time = url.searchParams.get("t");
  if (!time) return null;
  const seconds = parseYouTubeTime(time);

  return seconds && seconds > 0 ? seconds : null;
}

function parseYouTubeTime(value: string) {
  const numericSeconds = parsePositiveInteger(value.replace(/s$/, ""));
  if (numericSeconds) return numericSeconds;

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : null;
}

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function getDailymotionVideoId(url: URL) {
  const segments = getCleanPathSegments(url);
  if (url.hostname.toLowerCase() === "dai.ly") return sanitizeProviderId(segments[0]);
  if (segments[0] !== "video") return null;

  return sanitizeProviderId(segments[1]?.split("_")[0] ?? null);
}

function sanitizeProviderId(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;

  return trimmed;
}
