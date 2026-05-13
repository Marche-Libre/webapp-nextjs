const HTTP_URL_REGEX = /https?:\/\/[^\s<>"')]+/i;

export function extractFirstHttpUrl(content: string) {
  const match = content.match(HTTP_URL_REGEX);
  if (!match) return null;

  return trimTrailingUrlPunctuation(match[0]);
}

function trimTrailingUrlPunctuation(url: string) {
  let nextUrl = url;

  while (/[),.;:!?]$/.test(nextUrl)) {
    nextUrl = nextUrl.slice(0, -1);
  }

  return nextUrl;
}
