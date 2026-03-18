import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.DB_PATH ?? path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "travel-planner.db");

export function initializeDatabase(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const sqlite = new Database(DB_FILE);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT,
      destinations TEXT,
      theme TEXT,
      start_date TEXT,
      end_date TEXT,
      outbound_flight TEXT,
      return_flight TEXT,
      hotel TEXT,
      budget TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      title TEXT NOT NULL,
      title_ja TEXT,
      location TEXT,
      location_ja TEXT,
      category TEXT NOT NULL,
      transport TEXT,
      transport_duration TEXT,
      memo TEXT,
      map_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      memo TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      location TEXT,
      mood TEXT NOT NULL,
      weather TEXT,
      temperature REAL,
      photo_ids TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_food_spots (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      name TEXT NOT NULL,
      name_ja TEXT,
      category TEXT,
      area TEXT,
      address TEXT,
      rating REAL,
      price_range TEXT,
      hours TEXT,
      place_id TEXT,
      google_rating REAL,
      google_review_count INTEGER,
      data TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checklists (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      trip_id TEXT REFERENCES trips(id),
      filename TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      timestamp TEXT,
      lat REAL,
      lng REAL,
      city TEXT,
      journal_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  sqlite.close();
}
