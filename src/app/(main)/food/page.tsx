"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FoodCard } from "@/components/food/food-card";
import { FoodDetail } from "@/components/food/food-detail";
import { FoodSearchDrawer } from "@/components/food/food-search-drawer";
import { getCityById } from "@/lib/data/destinations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTripConfig } from "@/hooks/use-trip-config";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { FoodCategory, FoodSpot } from "@/types/food";
import { FOOD_CATEGORY_CONFIG } from "@/types/food";
import type { GooglePlaceResult } from "@/types/food-search";
import type { RecommendationResult } from "@/types/recommendation";

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

function recommendationToFoodSpot(item: RecommendationResult): FoodSpot {
  return {
    id: `rec_${item.placeId}`,
    name: item.name,
    nameJa: item.nameJa,
    category: "other",
    area: item.cityName,
    address: item.address,
    addressJa: item.address,
    rating: item.rating,
    priceRange: "가격 미상",
    hours: "영업시간 미등록",
    recommendedMenu: [],
    visited: false,
    lat: item.lat,
    lng: item.lng,
    googleRating: item.rating,
    googleReviewCount: item.reviewCount,
    placeId: item.placeId,
    mapUrl: item.googleMapsUrl,
  };
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
    priceRange: place.priceLevel ? "¥".repeat(place.priceLevel) : "가격 미상",
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

function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="p-3 border rounded-lg space-y-2 animate-pulse">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export default function FoodPage() {
  const { config } = useTripConfig();

  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const [userSpots, setUserSpots] = useLocalStorage<FoodSpot[]>(
    "user_food_spots",
    []
  );

  const destinations = config.destinations ?? [];
  const effectiveDestinations =
    destinations.length > 0 ? destinations : ["osaka"];

  const {
    items: recommendedItems,
    loading: recLoading,
    refresh: recRefresh,
  } = useRecommendations({
    cities: effectiveDestinations,
    type: "food",
  });

  const recommendedSpots = useMemo(
    () => recommendedItems.map(recommendationToFoodSpot),
    [recommendedItems]
  );

  const selectedCities = useMemo(
    () =>
      effectiveDestinations
        .map((id) => getCityById(id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined),
    [effectiveDestinations]
  );

  const addedPlaceIds: Set<string> = useMemo(
    () =>
      new Set<string>(
        userSpots.map((s) => s.placeId).filter((id): id is string => !!id)
      ),
    [userSpots]
  );

  function applyFilters(spots: FoodSpot[]): FoodSpot[] {
    const query = normalizeKo(searchQuery);
    return spots.filter((spot) => {
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
  }

  const filteredRecommended = useMemo(
    () => applyFilters(recommendedSpots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, selectedCategory, searchQuery, recommendedSpots]
  );

  const filteredUserSpots = useMemo(
    () => applyFilters(userSpots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, selectedCategory, searchQuery, userSpots]
  );

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
    setDetailDrawerOpen(true);
  }

  function handleDetailClose() {
    setDetailDrawerOpen(false);
    setSelectedSpot(null);
  }

  const cityLabel = selectedCities.map((c) => c.name).join(" · ");
  const totalCount = filteredRecommended.length + filteredUserSpots.length;

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

          <p className="text-xs text-muted-foreground mb-2">
            {cityLabel
              ? `${cityLabel} 맛집 ${totalCount}개`
              : `맛집 ${totalCount}개`}
          </p>

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

      <div className="px-4 py-4 space-y-6">
        {/* 추천 맛집 section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">추천 맛집</h2>
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
            <RecommendationSkeleton />
          ) : filteredRecommended.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <p className="text-3xl mb-2">🍽</p>
              <p className="text-muted-foreground text-sm">
                {searchQuery || selectedCategory !== "all"
                  ? "필터에 맞는 추천 맛집이 없습니다"
                  : "추천 맛집을 불러오는 중..."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredRecommended.map((spot) => (
                <FoodCard
                  key={spot.id}
                  spot={spot}
                  onClick={() => handleCardClick(spot)}
                />
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* 내가 추가한 맛집 section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              내가 추가한 맛집
              {userSpots.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {filteredUserSpots.length}개
                </span>
              )}
            </h2>
          </div>

          {filteredUserSpots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <p className="text-3xl mb-2">🔖</p>
              <p className="text-muted-foreground text-sm">
                {userSpots.length === 0
                  ? "아직 추가한 맛집이 없어요"
                  : "필터에 맞는 맛집이 없습니다"}
              </p>
              {userSpots.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setAddDrawerOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  맛집 추가하기
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredUserSpots.map((spot) => (
                <FoodCard
                  key={spot.id}
                  spot={spot}
                  onClick={() => handleCardClick(spot)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Food detail drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selectedSpot?.name ?? "맛집 상세"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
            {selectedSpot && (
              <FoodDetail spot={selectedSpot} onClose={handleDetailClose} />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <FoodSearchDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        addedPlaceIds={addedPlaceIds}
        onAdd={handleAddPlace}
      />
    </div>
  );
}
