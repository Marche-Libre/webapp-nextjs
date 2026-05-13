export const LAUNCH_CHAT_CHANNEL_SLUGS = [
  "general",
  "business",
  "politique",
  "divers",
  "jobs",
] as const;

type LaunchChatChannelSlug = (typeof LAUNCH_CHAT_CHANNEL_SLUGS)[number];

const LAUNCH_CHAT_CHANNEL_ORDER = new Map<LaunchChatChannelSlug, number>(
  LAUNCH_CHAT_CHANNEL_SLUGS.map((slug, index) => [slug, index]),
);

export function isLaunchChatChannelSlug(slug: string): slug is LaunchChatChannelSlug {
  return LAUNCH_CHAT_CHANNEL_SLUGS.includes(slug as LaunchChatChannelSlug);
}

function getLaunchChatChannelSortOrder(slug: string) {
  if (!isLaunchChatChannelSlug(slug)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return LAUNCH_CHAT_CHANNEL_ORDER.get(slug) ?? Number.MAX_SAFE_INTEGER;
}

export function sortLaunchChatChannels<T extends { slug: string }>(channels: T[]) {
  return [...channels].sort((leftChannel, rightChannel) => {
    const leftOrder = getLaunchChatChannelSortOrder(leftChannel.slug);
    const rightOrder = getLaunchChatChannelSortOrder(rightChannel.slug);
    return leftOrder - rightOrder;
  });
}
