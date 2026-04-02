"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useActiveChannel } from "@/components/chat/chat-channel-context";

export default function ChatChannelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setActiveSlug, activeSlug } = useActiveChannel();

  useEffect(() => {
    if (slug && slug !== activeSlug) {
      setActiveSlug(slug);
    }
  }, [slug, activeSlug, setActiveSlug]);

  // ChatMain in the layout handles all rendering
  return null;
}
