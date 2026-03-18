"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AttractionCard,
  AttractionSkeleton,
  type SavedAttraction,
} from "@/components/attractions/attraction-card";
import { AttractionSearchDrawer } from "@/components/attractions/attraction-search-drawer";
import { getCityById } from "@/lib/data/destinations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useActiveTrip } from "@/hooks/use-trip";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { RecommendationResult } from "@/types/recommendation";
import type { GooglePlaceResult } from "@/types/food-search";
import { NoTripPrompt } from "@/components/common/no-trip-prompt";

function normalizeKo(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "");
}

function recommendationToAttraction(
  item: RecommendationResult
): SavedAttraction {
  return {
    placeId: item.placeId,
    name: item.name,
    nameJa: item.nameJa,
    address: item.address,
    rating: item.rating,
    reviewCount: item.reviewCount,
    city: item.city,
    cityName: item.cityName,
    googleMapsUrl: item.googleMapsUrl,
    openNow: item.openNow,
    lat: item.lat,
    lng: item.lng,
    source: "recommendation",
  };
}

function placeToAttraction(
  place: GooglePlaceResult,
  city: string,
  cityName: string
): SavedAttraction {
  return {
    placeId: place.placeId,
    name: place.name,
    nameJa: place.nameJa ?? place.name,
    address: place.address,
    rating: place.rating,
    reviewCount: place.userRatingsTotal,
    city,
    cityName,
    openNow: place.openNow,
    lat: place.lat,
    lng: place.lng,
    source: "user",
  };
}

function parseDest(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export default function AttractionsPage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();

  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const [savedAttractionIds, setSavedAttractionIds] = useLocalStorage<
    string[]
  >("scheduled_attraction_ids", []);

  const [userAttractions, setUserAttractions] = useLocalStorage<
    SavedAttraction[]
  >("user_attractions", []);

  const destinations = parseDest(activeTrip?.destinations);
  const effectiveDestinations = destinations.length > 0 ? destinations : [];

  // All hooks MUST be before any conditional return
  const {
    items: recommendedItems,
    loading: recLoading,
    refresh: recRefresh,
  } = useRecommendations({
    cities: effectiveDestinations,
    type: "attraction",
    enabled: !!activeTrip,
  });

  const selectedCities = useMemo(
    () =>
      effectiveDestinations
        .map((id) => getCityById(id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined),
    [effectiveDestinations]
  );

  const recommendedAttractions = useMemo(
    () => recommendedItems.map(recommendationToAttraction),
    [recommendedItems]
  );

  const addedPlaceIds = useMemo(
    () => new Set(userAttractions.map((a) => a.placeId)),
    [userAttractions]
  );

  const scheduledSet = useMemo(
    () => new Set(savedAttractionIds),
    [savedAttractionIds]
  );

  function applyFilters(attractions: SavedAttraction[]): SavedAttraction[] {
    const query = normalizeKo(searchQuery);
    return attractions.filter((a) => {
      const matchesCity = selectedCity === "all" || a.city === selectedCity;
      const matchesSearch =
        !query ||
        normalizeKo(a.name).includes(query) ||
        normalizeKo(a.nameJa).includes(query) ||
        normalizeKo(a.cityName).includes(query);
      return matchesCity && matchesSearch;
    });
  }

  const filteredRecommended = useMemo(
    () => applyFilters(recommendedAttractions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, searchQuery, recommendedAttractions]
  );

  const filteredUserAttractions = useMemo(
    () => applyFilters(userAttractions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, searchQuery, userAttractions]
  );

  // Conditional returns AFTER all hooks
  if (tripLoading) {
    return <div className="px-4 py-6 space-y-3"><div className="h-32 w-full bg-muted rounded-lg animate-pulse" /></div>;
  }

  if (!activeTrip) {
    return <NoTripPrompt icon="🏯" />;
  }

  function handleSchedule(attraction: SavedAttraction) {
    setSavedAttractionIds((prev) => {
      if (prev.includes(attraction.placeId)) return prev;
      return [...prev, attraction.placeId];
    });
  }

  function handleAddPlace(place: GooglePlaceResult) {
    const firstCity = selectedCities[0];
    const city = firstCity?.id ?? "osaka";
    const cityName = firstCity?.name ?? "오사카";
    const attraction = placeToAttraction(place, city, cityName);
    setUserAttractions((prev) => {
      const alreadyExists = prev.some((a) => a.placeId === place.placeId);
      if (alreadyExists) return prev;
      return [...prev, attraction];
    });
  }

  const cityLabel = selectedCities.map((c) => c.name).join(" · ");
  const totalCount = filteredRecommended.length + filteredUserAttractions.length;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-3">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="명소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setAddDrawerOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs">명소 검색 추가</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {cityLabel
              ? `${cityLabel} 명소 ${totalCount}개`
              : `명소 ${totalCount}개`}
          </p>

          {selectedCities.length > 1 && (
            <Tabs
              value={selectedCity}
              onValueChange={(v) => setSelectedCity(v)}
            >
              <TabsList className="flex h-auto gap-1 bg-transparent p-0 overflow-x-auto w-full justify-start">
                <TabsTrigger
                  value="all"
                  className="shrink-0 rounded-full border data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs px-3 py-1.5"
                >
                  전체
                </TabsTrigger>
                {selectedCities.map((city) => (
                  <TabsTrigger
                    key={city.id}
                    value={city.id}
                    className="shrink-0 rounded-full border data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs px-3 py-1.5"
                  >
                    {city.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* 추천 명소 section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">추천 명소</h2>
              <div className="flex gap-1">
                {selectedCities.map((city) => (
                  <Badge key={city.id} variant="secondary" className="text-xs">
                    {city.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={recRefresh}
              disabled={recLoading}
            >
              {recLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              새로고침
            </Button>
          </div>

          {recLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <AttractionSkeleton key={n} />
              ))}
            </div>
          ) : filteredRecommended.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <p className="text-3xl mb-2">🏯</p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "검색 결과가 없습니다"
                  : "추천 명소를 불러오는 중..."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredRecommended.map((attraction) => (
                <AttractionCard
                  key={attraction.placeId}
                  attraction={attraction}
                  onSchedule={handleSchedule}
                  scheduled={scheduledSet.has(attraction.placeId)}
                />
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* 내가 추가한 명소 section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              내가 추가한 명소
              {userAttractions.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {filteredUserAttractions.length}개
                </span>
              )}
            </h2>
          </div>

          {filteredUserAttractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <p className="text-3xl mb-2">🗺</p>
              <p className="text-muted-foreground text-sm">
                {userAttractions.length === 0
                  ? "아직 추가한 명소가 없어요"
                  : "필터에 맞는 명소가 없습니다"}
              </p>
              {userAttractions.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setAddDrawerOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  명소 추가하기
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredUserAttractions.map((attraction) => (
                <AttractionCard
                  key={attraction.placeId}
                  attraction={attraction}
                  onSchedule={handleSchedule}
                  scheduled={scheduledSet.has(attraction.placeId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AttractionSearchDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        addedPlaceIds={addedPlaceIds}
        onAdd={handleAddPlace}
      />
    </div>
  );
}
