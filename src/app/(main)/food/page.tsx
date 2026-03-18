"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Loader2, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FoodCard } from "@/components/food/food-card";
import { FoodDetail } from "@/components/food/food-detail";
import { getFoodSpotsForCities } from "@/lib/data/food-registry";
import { getCityById } from "@/lib/data/destinations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTripConfig } from "@/hooks/use-trip-config";
import type { FoodCategory, FoodSpot } from "@/types/food";
import { FOOD_CATEGORY_CONFIG } from "@/types/food";
import type { GooglePlaceResult } from "@/types/food-search";
import { cn } from "@/lib/utils";

type FilterCategory = "all" | FoodCategory;

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "전체" },
  ...Object.entries(FOOD_CATEGORY_CONFIG).map(([key, config]) => ({
    key: key as FoodCategory,
    label: config.label,
  })),
];

function normalizeKo(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "");
}

function placeToFoodSpot(place: GooglePlaceResult, cityName: string): FoodSpot {
  return {
    id: `google_${place.placeId}`,
    name: place.name,
    nameJa: place.nameJa ?? place.name,
    category: "other",
    area: cityName,
    address: place.address,
    addressJa: place.address,
    rating: place.rating,
    priceRange: place.priceLevel
      ? "¥".repeat(place.priceLevel)
      : "가격 미상",
    hours: "영업시간 미등록",
    recommendedMenu: [],
    visited: false,
    lat: place.lat,
    lng: place.lng,
    googleRating: place.rating,
    googleReviewCount: place.userRatingsTotal,
    placeId: place.placeId,
  };
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
          {place.priceLevel && (
            <span>{"¥".repeat(place.priceLevel)}</span>
          )}
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

export default function FoodPage() {
  const { config } = useTripConfig();

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReadonlyArray<GooglePlaceResult>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [userSpots, setUserSpots] = useLocalStorage<FoodSpot[]>(
    "user_food_spots",
    []
  );

  const destinations = config.destinations ?? [];
  const effectiveDestinations = destinations.length > 0 ? destinations : ["osaka"];

  const citySpots = useMemo(
    () => getFoodSpotsForCities(effectiveDestinations),
    [effectiveDestinations]
  );

  const selectedCities = useMemo(
    () =>
      effectiveDestinations
        .map((id) => getCityById(id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined),
    [effectiveDestinations]
  );

  const addedPlaceIds = useMemo(
    () => new Set(userSpots.map((s) => s.placeId).filter(Boolean)),
    [userSpots]
  );

  const allSpots = useMemo(
    () => [...citySpots, ...userSpots],
    [citySpots, userSpots]
  );

  const filtered = useMemo(() => {
    const query = normalizeKo(searchQuery);
    return allSpots.filter((spot) => {
      const matchesCity =
        selectedCity === "all" ||
        getCityById(selectedCity)?.name === spot.area ||
        spot.area.includes(getCityById(selectedCity)?.name ?? "__none__");
      const matchesCategory =
        selectedCategory === "all" || spot.category === selectedCategory;
      const matchesSearch =
        !query ||
        normalizeKo(spot.name).includes(query) ||
        normalizeKo(spot.nameJa).includes(query) ||
        normalizeKo(spot.area).includes(query);
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [selectedCity, selectedCategory, searchQuery, allSpots]);

  async function handleSearch() {
    if (!addSearchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/food/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: addSearchQuery.trim() }),
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
    const currentCityName = selectedCities[0]?.name ?? "오사카";
    const spot = placeToFoodSpot(place, currentCityName);
    setUserSpots((prev) => {
      const alreadyExists = prev.some((s) => s.placeId === place.placeId);
      if (alreadyExists) return prev;
      return [...prev, spot];
    });
  }

  function handleCardClick(spot: FoodSpot) {
    setSelectedSpot(spot);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
    setSelectedSpot(null);
  }

  function handleAddDrawerClose() {
    setAddDrawerOpen(false);
    setAddSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  }

  const cityLabel = selectedCities.map((c) => c.name).join(" · ");
  const headerLabel = cityLabel
    ? `${cityLabel} 맛집 ${allSpots.length}개`
    : `맛집 ${allSpots.length}개`;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-3">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="맛집 검색..."
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
              <span className="text-xs">맛집 검색 추가</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-2">{headerLabel}</p>

          {selectedCities.length > 1 && (
            <Tabs
              value={selectedCity}
              onValueChange={(v) => setSelectedCity(v)}
              className="mb-2"
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

          <Tabs
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as FilterCategory)}
          >
            <TabsList className="flex h-auto gap-1 bg-transparent p-0 overflow-x-auto w-full justify-start">
              {CATEGORY_FILTERS.map(({ key, label }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="shrink-0 rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length}개 맛집
          {userSpots.length > 0 && (
            <span className="ml-1">(내가 추가: {userSpots.length}개)</span>
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">🍽</p>
            <p className="text-muted-foreground text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((spot) => (
              <FoodCard
                key={spot.id}
                spot={spot}
                onClick={() => handleCardClick(spot)}
              />
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selectedSpot?.name ?? "맛집 상세"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
            {selectedSpot && (
              <FoodDetail spot={selectedSpot} onClose={handleClose} />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={addDrawerOpen} onOpenChange={setAddDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>맛집 검색 추가</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="식당 이름 또는 키워드..."
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
                <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
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
                <p className="text-3xl mb-2">🍜</p>
                <p className="text-sm text-muted-foreground">
                  식당 이름이나 음식 종류로 검색해보세요
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
