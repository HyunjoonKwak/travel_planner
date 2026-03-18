import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Trip - the top-level entity
export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g., "오사카·교토 벚꽃여행"
  country: text("country"), // e.g., "JP"
  destinations: text("destinations"), // JSON array of city IDs: ["osaka","kyoto"]
  theme: text("theme"), // e.g., "벚꽃여행"
  startDate: text("start_date"),
  endDate: text("end_date"),
  outboundFlight: text("outbound_flight"), // JSON
  returnFlight: text("return_flight"), // JSON
  hotel: text("hotel"), // JSON
  budget: text("budget"), // JSON
  isActive: integer("is_active").default(1), // current trip
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Schedule items - belong to a trip
export const schedules = sqliteTable("schedules", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  title: text("title").notNull(),
  titleJa: text("title_ja"),
  location: text("location"),
  locationJa: text("location_ja"),
  category: text("category").notNull(),
  transport: text("transport"),
  transportDuration: text("transport_duration"),
  memo: text("memo"),
  mapUrl: text("map_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Expenses - belong to a trip
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  date: text("date").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(), // "JPY" | "KRW"
  category: text("category").notNull(),
  description: text("description").notNull(),
  memo: text("memo"),
  createdAt: text("created_at").notNull(),
});

// Journal entries - belong to a trip
export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  date: text("date").notNull(),
  content: text("content").notNull(),
  location: text("location"),
  mood: text("mood").notNull(),
  weather: text("weather"),
  temperature: real("temperature"),
  photoIds: text("photo_ids"), // JSON array
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Food spots saved by user - belong to a trip
export const savedFoodSpots = sqliteTable("saved_food_spots", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  name: text("name").notNull(),
  nameJa: text("name_ja"),
  category: text("category"),
  area: text("area"),
  address: text("address"),
  rating: real("rating"),
  priceRange: text("price_range"),
  hours: text("hours"),
  placeId: text("place_id"),
  googleRating: real("google_rating"),
  googleReviewCount: integer("google_review_count"),
  data: text("data"), // Full JSON for extra fields
  createdAt: text("created_at").notNull(),
});

// Checklist - belong to a trip
export const checklists = sqliteTable("checklists", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  data: text("data").notNull(), // JSON of checklist groups
  updatedAt: text("updated_at").notNull(),
});

// Photos metadata - belong to a trip
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").references(() => trips.id),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  timestamp: text("timestamp"),
  lat: real("lat"),
  lng: real("lng"),
  city: text("city"),
  journalId: text("journal_id"),
  createdAt: text("created_at").notNull(),
});
