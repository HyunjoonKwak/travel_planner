"use client";

import { useEffect } from "react";

const LEGACY_KEYS = [
  "trip-config",
  "travel-schedule",
  "japan-expenses",
  "travel-expenses",
  "journal_entries",
  "user_food_spots",
  "budget_yen",
  "budget_yen_raw",
  "checklist_data",
  "recommendations_food_",
  "recommendations_attraction_",
];

export function LegacyCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cleaned = window.localStorage.getItem("legacy_cleaned");
    if (cleaned) return;

    for (const key of LEGACY_KEYS) {
      window.localStorage.removeItem(key);
    }

    // Remove recommendation caches (prefix match)
    const allKeys = Object.keys(window.localStorage);
    for (const key of allKeys) {
      if (
        key.startsWith("recommendations_") ||
        key.startsWith("trip-config")
      ) {
        window.localStorage.removeItem(key);
      }
    }

    window.localStorage.setItem("legacy_cleaned", "1");
  }, []);

  return null;
}
