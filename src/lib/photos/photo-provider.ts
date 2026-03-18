import type { PhotoMeta, PhotoWithUrl } from "@/types/photo";

// Provider interface - same API for IndexedDB, NAS, cloud
export interface PhotoProvider {
  upload(file: File, meta?: Partial<PhotoMeta>): Promise<PhotoMeta>;
  uploadMultiple(files: File[]): Promise<PhotoMeta[]>;
  getPhoto(id: string): Promise<PhotoWithUrl | null>;
  getPhotos(filters?: PhotoFilters): Promise<PhotoWithUrl[]>;
  getPhotosByJournal(journalId: string): Promise<PhotoWithUrl[]>;
  getThumbnailUrl(id: string): Promise<string | null>;
  deletePhoto(id: string): Promise<void>;
}

export interface PhotoFilters {
  journalId?: string;
  scheduleItemId?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}
