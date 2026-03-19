"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecommendationResult } from "@/types/recommendation";

interface UseRecommendationsOptions {
  cities: ReadonlyArray<string>;
  type: "food" | "attraction";
  enabled?: boolean;
}

// In-memory cache (survives within session, cleared on full reload)
const memoryCache = new Map<string, { data: RecommendationResult[]; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildCacheKey(type: string, cities: ReadonlyArray<string>): string {
  return `recommendations_${type}_${[...cities].sort().join(",")}`;
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

    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setItems(cached.data);
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
        memoryCache.set(cacheKey, { data: data.results, timestamp: Date.now() });
      } else {
        setError(data.status as string);
      }
    } catch {
      setError("FETCH_ERROR");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refresh = useCallback(() => {
    memoryCache.delete(cacheKey);
    fetchRecommendations();
  }, [cacheKey, fetchRecommendations]);

  return { items, loading, error, refresh };
}
