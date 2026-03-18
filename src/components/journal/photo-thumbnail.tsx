"use client";

import { useEffect, useState } from "react";
import { LocalPhotoProvider } from "@/lib/photos/local-provider";

const provider = new LocalPhotoProvider();

interface PhotoThumbnailProps {
  /** Base64 data URL (legacy), blob: object URL, or photo ID (new format) */
  readonly photoRef: string;
  readonly alt?: string;
  readonly className?: string;
}

function isDataUrl(value: string): boolean {
  return value.startsWith("data:");
}

function isObjectUrl(value: string): boolean {
  return value.startsWith("blob:");
}

export function PhotoThumbnail({ photoRef, alt = "사진", className }: PhotoThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [revokeUrl, setRevokeUrl] = useState<string | null>(null);

  useEffect(() => {
    // Direct URLs (legacy base64 or already-resolved object URLs)
    if (isDataUrl(photoRef) || isObjectUrl(photoRef)) {
      setSrc(photoRef);
      return;
    }

    // Photo ID – load thumbnail from IndexedDB via provider
    let cancelled = false;

    provider
      .getThumbnailUrl(photoRef)
      .then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          setSrc(url);
          setRevokeUrl(url);
        }
      })
      .catch(() => {
        // Thumbnail unavailable – leave src null (shows placeholder)
      });

    return () => {
      cancelled = true;
    };
  }, [photoRef]);

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [revokeUrl]);

  if (!src) {
    return (
      <div
        className={className ?? "h-16 w-16 flex-shrink-0 rounded-md bg-muted animate-pulse"}
        aria-label="사진 로딩중"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className ?? "h-full w-full object-cover"}
    />
  );
}
