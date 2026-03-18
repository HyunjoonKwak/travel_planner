export interface PhotoMeta {
  readonly id: string;
  readonly source: PhotoSource;
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly width?: number;
  readonly height?: number;
  readonly timestamp?: string; // EXIF date or upload time
  readonly location?: PhotoLocation;
  readonly city?: string; // auto-mapped from GPS
  readonly tags?: ReadonlyArray<string>;
  readonly journalId?: string;
  readonly scheduleItemId?: string;
  readonly thumbnailId?: string;
  readonly createdAt: string;
}

export interface PhotoLocation {
  readonly lat: number;
  readonly lng: number;
  readonly address?: string;
}

export type PhotoSource = "local" | "nas" | "icloud" | "google-photos";

export interface PhotoFile {
  readonly id: string;
  readonly blob: Blob;
}

export interface PhotoWithUrl extends PhotoMeta {
  readonly url: string;
  readonly thumbnailUrl?: string;
}
