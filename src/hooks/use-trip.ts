"use client";

import { useState, useEffect, useCallback } from "react";

export interface Trip {
  id: string;
  name: string;
  country: string | null;
  destinations: string | null;
  theme: string | null;
  startDate: string | null;
  endDate: string | null;
  outboundFlight: string | null;
  returnFlight: string | null;
  hotel: string | null;
  budget: string | null;
  isActive: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  name: string;
  country?: string;
  destinations?: string[];
  theme?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTripInput {
  name?: string;
  country?: string;
  destinations?: string[];
  theme?: string;
  startDate?: string;
  endDate?: string;
  outboundFlight?: unknown;
  returnFlight?: unknown;
  hotel?: unknown;
  budget?: unknown;
  isActive?: number;
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/trips");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setTrips(json.data as Trip[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback(
    async (input: CreateTripInput): Promise<Trip | null> => {
      try {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const created = json.data as Trip;
        setTrips((prev) => [created, ...prev]);
        return created;
      } catch {
        return null;
      }
    },
    []
  );

  const updateTrip = useCallback(
    async (tripId: string, input: UpdateTripInput): Promise<Trip | null> => {
      try {
        const res = await fetch(`/api/trips/${tripId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const updated = json.data as Trip;
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? updated : t))
        );
        return updated;
      } catch {
        return null;
      }
    },
    []
  );

  const deleteTrip = useCallback(async (tripId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      return true;
    } catch {
      return false;
    }
  }, []);

  return { trips, loading, error, createTrip, updateTrip, deleteTrip, refresh: fetchTrips };
}

export function useActiveTrip() {
  const { trips, loading, error, updateTrip, refresh } = useTrips();

  const activeTrip = trips.find((t) => t.isActive === 1) ?? trips[0] ?? null;

  const switchTrip = useCallback(
    async (tripId: string): Promise<boolean> => {
      try {
        // Deactivate all, activate selected
        await Promise.all(
          trips.map((t) =>
            updateTrip(t.id, { isActive: t.id === tripId ? 1 : 0 })
          )
        );
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [trips, updateTrip, refresh]
  );

  return { activeTrip, loading, error, switchTrip, refresh };
}
