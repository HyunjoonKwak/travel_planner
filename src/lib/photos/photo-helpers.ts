import type { PhotoMeta } from "@/types/photo";

export interface PhotoMetaRecord {
  id: string;
  source: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  timestamp?: string;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  tags?: string[];
  journalId?: string;
  scheduleItemId?: string;
  thumbnailId?: string;
  createdAt: string;
}

const THUMBNAIL_QUALITY = 0.7;

// Note: Callers are responsible for revoking object URLs via URL.revokeObjectURL()
// when the URL is no longer needed to prevent memory leaks.
export async function createThumbnail(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;
      const scale = Math.min(maxSize / width, maxSize / height, 1);
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create thumbnail blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        THUMBNAIL_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for thumbnail creation"));
    };

    img.src = objectUrl;
  });
}

export function recordToMeta(record: PhotoMetaRecord | undefined | null): PhotoMeta | null {
  if (!record) return null;

  return {
    id: record.id,
    source: record.source as PhotoMeta["source"],
    filename: record.filename,
    mimeType: record.mimeType,
    size: record.size,
    width: record.width,
    height: record.height,
    timestamp: record.timestamp,
    location:
      record.lat !== undefined && record.lng !== undefined
        ? { lat: record.lat, lng: record.lng, address: record.address }
        : undefined,
    city: record.city,
    tags: record.tags,
    journalId: record.journalId,
    scheduleItemId: record.scheduleItemId,
    thumbnailId: record.thumbnailId,
    createdAt: record.createdAt,
  };
}
