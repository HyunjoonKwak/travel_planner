"use client";

// Hook that provides the current photo provider.
// For now always returns LocalProvider.
// When Docker/NAS is configured, can switch to NASProvider.

import { useState, useCallback, useEffect } from "react";
import { LocalPhotoProvider } from "@/lib/photos/local-provider";
import type { PhotoMeta, PhotoWithUrl } from "@/types/photo";
import type { PhotoFilters } from "@/lib/photos/photo-provider";

const provider = new LocalPhotoProvider();

export function usePhotos(filters?: PhotoFilters) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = await provider.getPhotos(filters);
      setPhotos(results);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function upload(file: File, meta?: Partial<PhotoMeta>) {
    const result = await provider.upload(file, meta);
    await refresh();
    return result;
  }

  async function uploadMultiple(files: File[]) {
    const results = await provider.uploadMultiple(files);
    await refresh();
    return results;
  }

  async function deletePhoto(id: string) {
    await provider.deletePhoto(id);
    await refresh();
  }

  return { photos, loading, upload, uploadMultiple, deletePhoto, refresh };
}

export function useJournalPhotos(journalId: string) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    provider
      .getPhotosByJournal(journalId)
      .then((results) => {
        if (!cancelled) {
          setPhotos(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhotos([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [journalId]);

  return { photos, loading };
}

// Session-scoped object URL cache for resolving by photo ID
const photoUrlCache = new Map<string, string>();

/** Register a photo URL for session-scoped resolution */
export function registerPhotoUrl(id: string, url: string): void {
  photoUrlCache.set(id, url);
}

/** Resolve a photo URL by ID (works for session object URLs) */
export function resolvePhotoUrl(id: string): string | undefined {
  return photoUrlCache.get(id);
}
