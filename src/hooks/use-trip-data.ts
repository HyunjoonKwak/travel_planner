"use client";

import { useState, useEffect, useCallback } from "react";

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
