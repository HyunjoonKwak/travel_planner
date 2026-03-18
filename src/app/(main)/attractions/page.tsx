"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Loader2,
  MapPin,
  Star,
  ExternalLink,
  RefreshCw,
  CalendarPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getCityById } from "@/lib/data/destinations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTripConfig } from "@/hooks/use-trip-config";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { RecommendationResult } from "@/types/recommendation";
import type { GooglePlaceResult } from "@/types/food-search";
import { cn } from "@/lib/utils";

interface SavedAttraction {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly city: string;
  readonly cityName: string;
  readonly googleMapsUrl?: string;
  readonly openNow?: boolean;
  readonly lat?: number;
  readonly lng?: number;
  readonly source: "recommendation" | "user";
}

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

function AttractionCard({
  attraction,
  onSchedule,
  scheduled,
}: {
  attraction: SavedAttraction;
  onSchedule: (a: SavedAttraction) => void;
  scheduled: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-sm truncate">{attraction.name}</span>
              {attraction.openNow !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1 py-0 shrink-0",
                    attraction.openNow
                      ? "text-green-600 border-green-300"
                      : "text-muted-foreground"
                  )}
                >
                  {attraction.openNow ? "영업중" : "영업종료"}
                </Badge>
              )}
            </div>
            {attraction.nameJa && attraction.nameJa !== attraction.name && (
              <p className="text-xs text-muted-foreground">{attraction.nameJa}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {attraction.cityName}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
          {attraction.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {attraction.rating.toFixed(1)}
              </span>
              {attraction.reviewCount > 0 && (
                <span>({attraction.reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-1 mb-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{attraction.address}</span>
        </div>

        <div className="flex gap-2">
          {attraction.googleMapsUrl && (
            <a
              href={attraction.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                지도 보기
              </Button>
            </a>
          )}
          <Button
            variant={scheduled ? "secondary" : "default"}
            size="sm"
            className="flex-1 h-7 text-xs gap-1"
            onClick={() => onSchedule(attraction)}
            disabled={scheduled}
          >
            <CalendarPlus className="h-3 w-3" />
            {scheduled ? "저장됨" : "일정에 추가"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AttractionSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="h-7 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function SearchResultItem({
  place,
  onAdd,
  added,
}: {
  place: GooglePlaceResult;
  onAdd: (place: GooglePlaceResult) => void;
  added: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-medium text-sm truncate">{place.name}</span>
          {place.openNow !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1 py-0 shrink-0",
                place.openNow
                  ? "text-green-600 border-green-300"
                  : "text-muted-foreground"
              )}
            >
              {place.openNow ? "영업중" : "영업종료"}
            </Badge>
          )}
        </div>
        {place.nameJa && (
          <p className="text-xs text-muted-foreground mb-1">{place.nameJa}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {place.rating.toFixed(1)}
            </span>
            <span>({place.userRatingsTotal.toLocaleString()})</span>
          </div>
        </div>
        <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
          <span className="truncate">{place.address}</span>
        </div>
      </div>
      <Button
        size="sm"
        variant={added ? "secondary" : "default"}
        className="shrink-0 h-8 text-xs"
        onClick={() => onAdd(place)}
        disabled={added}
      >
        {added ? "추가됨" : "추가"}
      </Button>
    </div>
  );
}

function SearchResultSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-8 w-14 shrink-0" />
    </div>
  );
}

export default function AttractionsPage() {
  const { config } = useTripConfig();

  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    ReadonlyArray<GooglePlaceResult>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [savedAttractionIds, setSavedAttractionIds] = useLocalStorage<
    string[]
  >("scheduled_attraction_ids", []);

  const [userAttractions, setUserAttractions] = useLocalStorage<
    SavedAttraction[]
  >("user_attractions", []);

  const destinations = config.destinations ?? [];
  const effectiveDestinations =
    destinations.length > 0 ? destinations : ["osaka"];

  const {
    items: recommendedItems,
    loading: recLoading,
    refresh: recRefresh,
  } = useRecommendations({
    cities: effectiveDestinations,
    type: "attraction",
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

  function handleSchedule(attraction: SavedAttraction) {
    setSavedAttractionIds((prev) => {
      if (prev.includes(attraction.placeId)) return prev;
      return [...prev, attraction.placeId];
    });
  }

  async function handleSearch() {
    if (!addSearchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/food/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${addSearchQuery.trim()} 관광` }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data.results ?? []);
      setHasSearched(true);
    } catch {
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
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

  function handleAddDrawerClose() {
    setAddDrawerOpen(false);
    setAddSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
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

      {/* Add attraction search drawer */}
      <Drawer open={addDrawerOpen} onOpenChange={setAddDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>명소 검색 추가</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="명소 이름 또는 키워드..."
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !addSearchQuery.trim()}
                className="shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isSearching && (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n}>
                    <SearchResultSkeleton />
                    {n < 3 && <Separator />}
                  </div>
                ))}
              </div>
            )}

            {!isSearching && hasSearched && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </p>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {searchResults.length}개 결과
                </p>
                {searchResults.map((place, idx) => (
                  <div key={place.placeId}>
                    <SearchResultItem
                      place={place}
                      onAdd={handleAddPlace}
                      added={addedPlaceIds.has(place.placeId)}
                    />
                    {idx < searchResults.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}

            {!isSearching && !hasSearched && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-3xl mb-2">🏯</p>
                <p className="text-sm text-muted-foreground">
                  명소 이름이나 키워드로 검색해보세요
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddDrawerClose}
              >
                닫기
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
