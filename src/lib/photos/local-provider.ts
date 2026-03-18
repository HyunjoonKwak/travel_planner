import { db } from "@/lib/db/dexie";
import { generateId } from "@/lib/utils/date";
import type { PhotoMeta, PhotoWithUrl } from "@/types/photo";
import type { PhotoProvider, PhotoFilters } from "./photo-provider";
import { createThumbnail, recordToMeta } from "./photo-helpers";

const THUMBNAIL_MAX_SIZE = 200;

export class LocalPhotoProvider implements PhotoProvider {
  async upload(file: File, meta?: Partial<PhotoMeta>): Promise<PhotoMeta> {
    try {
      const id = generateId();
      const thumbnailId = generateId();
      const now = new Date().toISOString();

      const thumbnail = await createThumbnail(file, THUMBNAIL_MAX_SIZE);

      await db.photoFiles.add({ id, blob: file });
      await db.thumbnails.add({ id: thumbnailId, blob: thumbnail });

      const record = {
        id,
        source: meta?.source ?? "local",
        filename: meta?.filename ?? file.name,
        mimeType: file.type,
        size: file.size,
        width: meta?.width,
        height: meta?.height,
        timestamp: meta?.timestamp ?? now,
        lat: meta?.location?.lat,
        lng: meta?.location?.lng,
        address: meta?.location?.address,
        city: meta?.city,
        tags: meta?.tags ? [...meta.tags] : undefined,
        journalId: meta?.journalId,
        scheduleItemId: meta?.scheduleItemId,
        thumbnailId,
        createdAt: now,
      };

      await db.photos.add(record);

      return recordToMeta(record)!;
    } catch (error) {
      throw new Error(
        `Photo upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async uploadMultiple(files: File[]): Promise<PhotoMeta[]> {
    const results = await Promise.allSettled(
      files.map((file) => this.upload(file))
    );

    const successful: PhotoMeta[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push(files[index].name);
      }
    });

    if (failed.length > 0) {
      throw new Error(`Failed to upload: ${failed.join(", ")}`);
    }

    return successful;
  }

  async getPhoto(id: string): Promise<PhotoWithUrl | null> {
    try {
      const [record, fileRecord] = await Promise.all([
        db.photos.get(id),
        db.photoFiles.get(id),
      ]);

      const meta = recordToMeta(record ?? null);
      if (!meta || !fileRecord) return null;

      // Note: caller must revoke URLs via URL.revokeObjectURL() when done
      const url = URL.createObjectURL(fileRecord.blob);

      let thumbnailUrl: string | undefined;
      if (meta.thumbnailId) {
        const thumbRecord = await db.thumbnails.get(meta.thumbnailId);
        if (thumbRecord) thumbnailUrl = URL.createObjectURL(thumbRecord.blob);
      }

      return { ...meta, url, thumbnailUrl };
    } catch (error) {
      throw new Error(
        `Failed to get photo: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getPhotos(filters?: PhotoFilters): Promise<PhotoWithUrl[]> {
    try {
      let query = db.photos.orderBy("createdAt").reverse();

      if (filters?.journalId) {
        query = db.photos.where("journalId").equals(filters.journalId).reverse();
      } else if (filters?.scheduleItemId) {
        query = db.photos.where("scheduleItemId").equals(filters.scheduleItemId).reverse();
      } else if (filters?.city) {
        query = db.photos.where("city").equals(filters.city).reverse();
      }

      let records = await query.toArray();

      if (filters?.dateFrom) {
        records = records.filter((r) => r.timestamp && r.timestamp >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        records = records.filter((r) => r.timestamp && r.timestamp <= filters.dateTo!);
      }

      // Note: returned object URLs must be revoked by caller when no longer needed
      const results = await Promise.allSettled(
        records.map(async (record) => {
          const meta = recordToMeta(record)!;
          const fileRecord = await db.photoFiles.get(record.id);
          if (!fileRecord) return null;

          const url = URL.createObjectURL(fileRecord.blob);

          let thumbnailUrl: string | undefined;
          if (record.thumbnailId) {
            const thumbRecord = await db.thumbnails.get(record.thumbnailId);
            if (thumbRecord) thumbnailUrl = URL.createObjectURL(thumbRecord.blob);
          }

          return { ...meta, url, thumbnailUrl } as PhotoWithUrl;
        })
      );

      return results
        .filter(
          (r): r is PromiseFulfilledResult<PhotoWithUrl | null> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value!);
    } catch (error) {
      throw new Error(
        `Failed to get photos: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getPhotosByJournal(journalId: string): Promise<PhotoWithUrl[]> {
    return this.getPhotos({ journalId });
  }

  async getThumbnailUrl(id: string): Promise<string | null> {
    try {
      const record = await db.photos.get(id);
      if (!record?.thumbnailId) return null;

      const thumbRecord = await db.thumbnails.get(record.thumbnailId);
      if (!thumbRecord) return null;

      // Note: caller must revoke this URL via URL.revokeObjectURL() when done
      return URL.createObjectURL(thumbRecord.blob);
    } catch (error) {
      throw new Error(
        `Failed to get thumbnail: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      const record = await db.photos.get(id);

      await db.transaction("rw", db.photos, db.photoFiles, db.thumbnails, async () => {
        await db.photoFiles.delete(id);
        if (record?.thumbnailId) await db.thumbnails.delete(record.thumbnailId);
        await db.photos.delete(id);
      });
    } catch (error) {
      throw new Error(
        `Failed to delete photo: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
