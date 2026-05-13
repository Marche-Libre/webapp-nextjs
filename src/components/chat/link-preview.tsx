"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type LinkPreviewData = {
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

type LinkPreviewState = LinkPreviewData & {
  sourceUrl: string;
};

type LinkPreviewProps = {
  url: string;
};

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewState | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [imageFailedUrl, setImageFailedUrl] = useState<string | null>(null);

  const handlePreviewResponse = useCallback(async (response: Response) => {
    if (!response.ok) {
      setFailedUrl(url);
      return;
    }

    const data = await response.json() as LinkPreviewData;
    setFailedUrl(null);
    setPreview({ ...data, sourceUrl: url });
  }, [url]);

  const handlePreviewError = useCallback((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") return;
    setFailedUrl(url);
  }, [url]);

  const handleImageError = useCallback(() => {
    setImageFailedUrl(url);
  }, [url]);

  const managePreviewLoadingEffect = useCallback(() => {
    const controller = new AbortController();

    void fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    })
      .then(handlePreviewResponse)
      .catch(handlePreviewError);

    return () => {
      controller.abort();
    };
  }, [handlePreviewError, handlePreviewResponse, url]);

  useEffect(managePreviewLoadingEffect, [managePreviewLoadingEffect]);

  const visiblePreview = preview?.sourceUrl === url ? preview : null;
  const failed = failedUrl === url;

  if (failed || !visiblePreview) return null;

  const title = visiblePreview.title ?? visiblePreview.siteName ?? visiblePreview.domain;
  const description = visiblePreview.description;
  const imageUrl = imageFailedUrl === url ? null : visiblePreview.imageUrl;

  return (
    <a
      href={visiblePreview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-[8px] block max-w-[420px] overflow-hidden rounded-lg border border-border-default bg-bg-elevated transition-colors hover:border-border-strong"
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- Link preview images are arbitrary remote Open Graph URLs.
        <img
          src={imageUrl}
          alt={title}
          onError={handleImageError}
          className="h-[150px] w-full object-cover border-b border-border-default bg-bg-surface"
        />
      )}
      <div className="p-[12px]">
        <div className="flex items-center gap-[6px] text-[11px] uppercase tracking-wide text-text-muted">
          <span className="truncate">{visiblePreview.siteName ?? visiblePreview.domain}</span>
          <ExternalLink className="h-[11px] w-[11px] shrink-0" />
        </div>
        <p className="mt-[4px] line-clamp-2 text-[13px] font-medium leading-snug text-text-primary">
          {title}
        </p>
        {description && (
          <p className="mt-[4px] line-clamp-2 text-[12px] leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
