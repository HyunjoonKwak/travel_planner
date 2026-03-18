import Dexie, { type Table } from "dexie";

interface PhotoMetaRecord {
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

interface PhotoFileRecord {
  id: string;
  blob: Blob;
}

class TravelPlannerDB extends Dexie {
  photos!: Table<PhotoMetaRecord, string>;
  photoFiles!: Table<PhotoFileRecord, string>;
  thumbnails!: Table<PhotoFileRecord, string>;

  constructor() {
    super("travel-planner");
    this.version(1).stores({
      photos:
        "id, source, journalId, scheduleItemId, city, timestamp, createdAt",
      photoFiles: "id",
      thumbnails: "id",
    });
  }
}

export const db = new TravelPlannerDB();
