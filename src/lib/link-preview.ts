import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type LinkPreviewMetadata = {
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

type AddressResolver = (hostname: string) => Promise<Array<{ address: string }>>;

const DEFAULT_TIMEOUT_MS = 3000;
const MAX_HTML_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const USER_AGENT = "LeMarcheLibreLinkPreview/1.0";
const BLOCKED_HOSTNAMES = new Set(["localhost", "local", "ip6-localhost", "ip6-loopback"]);

export async function fetchLinkPreview(inputUrl: string) {
  const safeUrl = await assertSafePreviewUrl(inputUrl);
  const response = await fetchPreviewResponse(safeUrl);
  const html = await readLimitedText(response);

  return extractLinkPreviewMetadata(safeUrl.toString(), html);
}

export async function assertSafePreviewUrl(inputUrl: string, resolver: AddressResolver = resolveHostname) {
  let url: URL;

  try {
    url = new URL(inputUrl);
  } catch {
    throw new Error("invalid_url");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("unsupported_protocol");
  }

  url.hash = "";

  const hostname = normalizeHostname(url.hostname);
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error("blocked_hostname");
  }

  if (isBlockedAddress(hostname)) {
    throw new Error("blocked_address");
  }

  if (isIP(hostname) === 0) {
    const addresses = await resolver(hostname);
    if (addresses.length === 0 || addresses.some((entry) => isBlockedAddress(entry.address))) {
      throw new Error("blocked_resolved_address");
    }
  }

  return url;
}

export function extractLinkPreviewMetadata(url: string, html: string): LinkPreviewMetadata {
  const parsedUrl = new URL(url);
  const title = getMetaContent(html, "og:title") ?? getTitle(html);
  const description = getMetaContent(html, "og:description") ?? getMetaContent(html, "description");
  const image = getMetaContent(html, "og:image") ?? getMetaContent(html, "twitter:image");

  return {
    url,
    domain: parsedUrl.hostname.replace(/^www\./, ""),
    title: cleanMetadataText(title),
    description: cleanMetadataText(description),
    imageUrl: resolveMetadataUrl(url, image),
    siteName: cleanMetadataText(getMetaContent(html, "og:site_name")),
  };
}

async function resolveHostname(hostname: string) {
  return lookup(hostname, { all: true, verbatim: false });
}

async function fetchPreviewResponse(initialUrl: URL) {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": USER_AGENT,
        },
        redirect: "manual",
        signal: controller.signal,
      });

      if (isRedirectStatus(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("invalid_redirect");
        currentUrl = await assertSafePreviewUrl(new URL(location, currentUrl).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error("fetch_failed");
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType && !contentType.toLowerCase().includes("text/html")) {
        throw new Error("unsupported_content_type");
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("too_many_redirects");
}

async function readLimitedText(response: Response) {
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    bytesRead += value.byteLength;
    if (bytesRead > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error("response_too_large");
    }

    chunks.push(value);
  }

  return new TextDecoder().decode(concatChunks(chunks, bytesRead));
}

function concatChunks(chunks: Uint8Array[], totalLength: number) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

function isRedirectStatus(status: number) {
  return status >= 300 && status < 400;
}

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

function isBlockedAddress(address: string) {
  const normalizedAddress = normalizeHostname(address);
  const ipVersion = isIP(normalizedAddress);

  if (ipVersion === 4) {
    return isBlockedIpv4(normalizedAddress);
  }

  if (ipVersion === 6) {
    return isBlockedIpv6(normalizedAddress);
  }

  return false;
}

function isBlockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 ||
    a === 192 && b === 168 ||
    a === 100 && b >= 64 && b <= 127 ||
    a === 198 && (b === 18 || b === 19) ||
    a >= 224
  );
}

function isBlockedIpv6(address: string) {
  const normalizedAddress = address.toLowerCase();

  return (
    normalizedAddress === "::1" ||
    normalizedAddress === "::" ||
    normalizedAddress.startsWith("fc") ||
    normalizedAddress.startsWith("fd") ||
    normalizedAddress.startsWith("fe8") ||
    normalizedAddress.startsWith("fe9") ||
    normalizedAddress.startsWith("fea") ||
    normalizedAddress.startsWith("feb") ||
    normalizedAddress.startsWith("::ffff:127.") ||
    normalizedAddress.startsWith("::ffff:10.") ||
    normalizedAddress.startsWith("::ffff:192.168.") ||
    normalizedAddress.startsWith("::ffff:169.254.")
  );
}

function getMetaContent(html: string, name: string) {
  const escapedName = escapeRegExp(name);
  const metaRegex = new RegExp(`<meta\\s+[^>]*(?:property|name)=["']${escapedName}["'][^>]*>`, "i");
  const metaTag = html.match(metaRegex)?.[0];
  if (!metaTag) return null;

  return getAttributeValue(metaTag, "content");
}

function getTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  return title ? decodeHtmlEntities(stripTags(title)) : null;
}

function getAttributeValue(tag: string, attributeName: string) {
  const escapedAttribute = escapeRegExp(attributeName);
  const attributeRegex = new RegExp(`${escapedAttribute}=["']([^"']*)["']`, "i");
  const value = tag.match(attributeRegex)?.[1] ?? null;

  return value ? decodeHtmlEntities(value) : null;
}

function cleanMetadataText(value: string | null) {
  const cleaned = value?.replace(/\s+/g, " ").trim() ?? null;
  return cleaned || null;
}

function resolveMetadataUrl(baseUrl: string, value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
