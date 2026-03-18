"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecommendationResult } from "@/types/recommendation";

interface UseRecommendationsOptions {
  cities: ReadonlyArray<string>;
  type: "food" | "attraction";
  enabled?: boolean;
}

interface CacheEntry {
  data: RecommendationResult[];
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildCacheKey(type: string, cities: ReadonlyArray<string>): string {
  return `recommendations_${type}_${[...cities].sort().join(",")}`;
}

function readCache(key: string): RecommendationResult[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: RecommendationResult[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function useRecommendations({
  cities,
  type,
  enabled = true,
}: UseRecommendationsOptions) {
  const [items, setItems] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = buildCacheKey(type, cities);

  const fetchRecommendations = useCallback(async () => {
    if (!enabled || cities.length === 0) return;

    const cached = readCache(cacheKey);
    if (cached) {
      setItems(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await globalThis.fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cities, type }),
      });
      const data = await res.json();

      if (data.status === "OK") {
        setItems(data.results);
        writeCache(cacheKey, data.results);
      } else {
        setError(data.status as string);
      }
    } catch {
      setError("FETCH_ERROR");
    } finally {
      setLoading(false);
    }
  }, [cities, type, enabled, cacheKey]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refresh = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(cacheKey);
      } catch {
        // ignore
      }
    }
    fetchRecommendations();
  }, [cacheKey, fetchRecommendations]);

  return { items, loading, error, refresh };
}
