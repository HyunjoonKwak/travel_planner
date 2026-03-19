"use client";

import { useEffect } from "react";

// All localStorage keys that were previously used and should now be cleaned up
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
  "checklist_groups",
  "scheduled_attraction_ids",
  "user_attractions",
  "completed-hiragana",
  "learning-hiragana",
  "completed-katakana",
  "learning-katakana",
  "saved-phrases",
  "study-streak",
  "dashboard-quick-memo",
];

const LEGACY_PREFIXES = [
  "recommendations_",
  "trip-config",
];

export function LegacyCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    for (const key of LEGACY_KEYS) {
      window.localStorage.removeItem(key);
    }

    // Remove keys by prefix match
    const allKeys = Object.keys(window.localStorage);
    for (const key of allKeys) {
      if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        window.localStorage.removeItem(key);
      }
    }

    // Remove the old cleanup flag too
    window.localStorage.removeItem("legacy_cleaned");
  }, []);

  return null;
}
