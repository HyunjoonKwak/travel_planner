"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Generic fetch hook for trip-scoped resources
function useTripResource<T>(tripId: string, resourcePath: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `/api/trips/${tripId}/${resourcePath}`;

  const refresh = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(baseUrl);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems(json.data as T[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [tripId, baseUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: unknown): Promise<T | null> => {
      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const created = json.data as T;
        setItems((prev) => [...prev, created]);
        return created;
      } catch {
        return null;
      }
    },
    [baseUrl]
  );

  const update = useCallback(
    async (itemId: string, data: unknown): Promise<T | null> => {
      try {
        const res = await fetch(`${baseUrl}/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const updated = json.data as T & { id: string };
        setItems((prev) =>
          prev.map((item) => {
            const i = item as T & { id: string };
            return i.id === itemId ? updated : item;
          })
        );
        return updated;
      } catch {
        return null;
      }
    },
    [baseUrl]
  );

  const remove = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const res = await fetch(`${baseUrl}/${itemId}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setItems((prev) => {
          const filtered = prev.filter((item) => {
            const i = item as T & { id: string };
            return i.id !== itemId;
          });
          return filtered;
        });
        return true;
      } catch {
        return false;
      }
    },
    [baseUrl]
  );

  return { items, loading, error, create, update, remove, refresh };
}

// Generic singleton hook for trip-scoped single-record resources
function useTripSingleton<T>(tripId: string, resourcePath: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const baseUrl = `/api/trips/${tripId}/${resourcePath}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const saveRef = useRef<(newData: T) => Promise<boolean>>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(baseUrl)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success && json.data != null) {
          setData(json.data as T);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tripId, baseUrl]);

  const save = useCallback(
    async (newData: T): Promise<boolean> => {
      setData(newData);
      pendingDataRef.current = null;
      try {
        const res = await fetch(baseUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: newData }),
        });
        const json = await res.json();
        return json.success === true;
      } catch {
        return false;
      }
    },
    [baseUrl]
  );
  saveRef.current = save;

  // Debounced save for frequent updates
  const debouncedSave = useCallback(
    (newData: T, delayMs = 500) => {
      setData(newData);
      pendingDataRef.current = newData;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        pendingDataRef.current = null;
        save(newData);
      }, delayMs);
    },
    [save]
  );

  // Flush pending debounced save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (pendingDataRef.current !== null && saveRef.current) {
        saveRef.current(pendingDataRef.current);
      }
    };
  }, []);

  return { data, loading, save, debouncedSave };
}

// Schedule types
export interface ScheduleItem {
  id: string;
  tripId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  title: string;
  titleJa: string | null;
  location: string | null;
  locationJa: string | null;
  category: string;
  transport: string | null;
  transportDuration: string | null;
  memo: string | null;
  mapUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useTripSchedules(tripId: string) {
  return useTripResource<ScheduleItem>(tripId, "schedules");
}

// Expense types
export interface ExpenseItem {
  id: string;
  tripId: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  memo: string | null;
  createdAt: string;
}

export function useTripExpenses(tripId: string) {
  return useTripResource<ExpenseItem>(tripId, "expenses");
}

// Journal types
export interface JournalEntry {
  id: string;
  tripId: string;
  date: string;
  content: string;
  location: string | null;
  mood: string;
  weather: string | null;
  temperature: number | null;
  photoIds: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useTripJournal(tripId: string) {
  return useTripResource<JournalEntry>(tripId, "journal");
}

// Saved attractions
export interface SavedAttractionItem {
  id: string;
  tripId: string;
  placeId: string;
  name: string;
  nameJa: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  city: string | null;
  cityName: string | null;
  googleMapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  source: string;
  createdAt: string;
}

export function useTripAttractions(tripId: string) {
  return useTripResource<SavedAttractionItem>(tripId, "attractions");
}

// User-added food spots
export interface SavedFoodSpotItem {
  id: string;
  tripId: string;
  name: string;
  nameJa: string | null;
  category: string | null;
  area: string | null;
  address: string | null;
  rating: number | null;
  priceRange: string | null;
  hours: string | null;
  placeId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  lat: number | null;
  lng: number | null;
  mapUrl: string | null;
}

export function useTripFoodSpots(tripId: string) {
  return useTripResource<SavedFoodSpotItem>(tripId, "food-spots");
}

// Checklist (singleton per trip)
export interface ChecklistGroupData {
  id: string;
  title: string;
  icon: string;
  items: Array<{
    id: string;
    label: string;
    checked: boolean;
  }>;
}

export function useTripChecklist(tripId: string) {
  return useTripSingleton<ChecklistGroupData[] | null>(tripId, "checklist", null);
}

// Learn progress (singleton per trip)
export interface LearnProgressData {
  completedHiragana: string[];
  learningHiragana: string[];
  completedKatakana: string[];
  learningKatakana: string[];
  savedPhrases: string[];
  studyStreak: number;
}

const DEFAULT_LEARN_PROGRESS: LearnProgressData = {
  completedHiragana: [],
  learningHiragana: [],
  completedKatakana: [],
  learningKatakana: [],
  savedPhrases: [],
  studyStreak: 0,
};

export function useTripLearnProgress(tripId: string) {
  return useTripSingleton<LearnProgressData>(tripId, "learn-progress", DEFAULT_LEARN_PROGRESS);
}

// Quick memo (singleton per trip)
export function useTripMemo(tripId: string) {
  return useTripSingleton<string>(tripId, "memos", "");
}
