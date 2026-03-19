"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { getFoodSpotsForCities } from "@/lib/data/food-registry";
import { getCityById } from "@/lib/data/destinations";
import { normalizeKo, parseDestinations } from "@/lib/utils/trip-helpers";
import { useActiveTrip } from "@/hooks/use-trip";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useTripFoodSpots } from "@/hooks/use-trip-data";
import type { FoodCategory, FoodSpot } from "@/types/food";
import { FOOD_CATEGORY_CONFIG } from "@/types/food";
import type { GooglePlaceResult } from "@/types/food-search";
import type { RecommendationResult } from "@/types/recommendation";
import { NoTripPrompt } from "@/components/common/no-trip-prompt";

type FilterCategory = "all" | FoodCategory;

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "전체" },
  ...Object.entries(FOOD_CATEGORY_CONFIG).map(([key, config]) => ({
    key: key as FoodCategory,
    label: config.label,
  })),
];

const TYPE_TO_CATEGORY: Record<string, FoodCategory> = {
  // Noodles
  ramen: "noodles",
  noodle_restaurant: "noodles",
  // Seafood
  sushi_restaurant: "seafood",
  seafood_restaurant: "seafood",
  // BBQ
  steak_house: "bbq",
  barbecue_restaurant: "bbq",
  // Cafe
  cafe: "cafe",
  coffee_shop: "cafe",
  bakery: "cafe",
  dessert_shop: "cafe",
  // Generic
  meal_takeaway: "other",
  meal_delivery: "other",
  restaurant: "other",
  food: "other",
};

function guessCategory(types: ReadonlyArray<string>, name: string): FoodCategory {
  for (const t of types) {
    const mapped = TYPE_TO_CATEGORY[t];
    if (mapped) return mapped;
  }
  const n = name.toLowerCase();
  // Noodles - JP/TW/TH/VN
  if (
    n.includes("라멘") || n.includes("ラーメン") || n.includes("麺") ||
    n.includes("pho") || n.includes("phở") || n.includes("bún") ||
    n.includes("pad thai") || n.includes("ก๋วยเตี๋ยว") ||
    n.includes("우동") || n.includes("うどん") || n.includes("そば") ||
    n.includes("牛肉麵") || n.includes("beef noodle")
  ) return "noodles";
  // Seafood
  if (
    n.includes("스시") || n.includes("寿司") || n.includes("鮨") ||
    n.includes("해산물") || n.includes("seafood") || n.includes("ปลา")
  ) return "seafood";
  // BBQ
  if (
    n.includes("야키니쿠") || n.includes("焼肉") || n.includes("焼き肉") ||
    n.includes("bbq") || n.includes("mookata") || n.includes("หมูกระทะ")
  ) return "bbq";
  // Street food
  if (
    n.includes("타코야키") || n.includes("たこ焼") ||
    n.includes("오코노미") || n.includes("お好み") ||
    n.includes("쿠시") || n.includes("串カツ") ||
    n.includes("banh mi") || n.includes("bánh mì") ||
    n.includes("satay") || n.includes("사테") ||
    n.includes("stinky tofu") || n.includes("臭豆腐")
  ) return "street_food";
  // Soup
  if (
    n.includes("tom yum") || n.includes("ต้มยำ") ||
    n.includes("soup") || n.includes("phở") ||
    n.includes("ramen")
  ) return "soup";
  // Cafe
  if (
    n.includes("카페") || n.includes("커피") || n.includes("コーヒー") ||
    n.includes("カフェ") || n.includes("coffee") || n.includes("cafe") ||
    n.includes("กาแฟ") || n.includes("cà phê")
  ) return "cafe";
  // Rice
  if (
    n.includes("볶음밥") || n.includes("curry") || n.includes("카레") ||
    n.includes("fried rice") || n.includes("ข้าว") || n.includes("cơm")
  ) return "rice";
  return "other";
}

function recommendationToFoodSpot(item: RecommendationResult): FoodSpot {
  const category = guessCategory(item.types ?? [], `${item.name} ${item.nameJa}`);
  return {
    id: `rec_${item.placeId}`,
    name: item.name,
    nameJa: item.nameJa,
    category,
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
  const category = guessCategory(place.types as string[], `${place.name} ${place.nameJa ?? ""}`);
  return {
    id: `google_${place.placeId}`,
    name: place.name,
    nameJa: place.nameJa ?? place.name,
    category,
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

function FoodSection({
  title,
  badge,
  spots,
  onCardClick,
  onDelete,
  deletable,
  emptyMessage,
  emptyIcon,
  action,
}: {
  title: string;
  badge?: React.ReactNode;
  spots: FoodSpot[];
  onCardClick: (spot: FoodSpot) => void;
  onDelete?: (id: string) => void;
  deletable?: boolean;
  emptyMessage: string;
  emptyIcon: string;
  action?: React.ReactNode;
}) {
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {badge}
          </div>
          {action}
        </div>
      )}
      {spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20">
          <p className="text-2xl mb-2">{emptyIcon}</p>
          <p className="text-muted-foreground text-xs">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {spots.map((spot) => (
            <FoodCard
              key={spot.id}
              spot={spot}
              onClick={() => onCardClick(spot)}
              onDelete={onDelete}
              deletable={deletable}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function FoodPage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const tripId = activeTrip?.id ?? "";
  const {
    items: dbUserSpots,
    loading: spotsLoading,
    create: createSpot,
    remove: removeSpot,
  } = useTripFoodSpots(tripId);

  const destinations = parseDestinations(activeTrip?.destinations);
  const effectiveDestinations = useMemo(
    () => (destinations.length > 0 ? destinations : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [destinations.join(",")],
  );

  // All hooks MUST be called before any conditional return
  const curatedSpots = useMemo(
    () => [...getFoodSpotsForCities(effectiveDestinations)],
    [effectiveDestinations],
  );

  const { items: recommendedItems, loading: recLoading, refresh: recRefresh } =
    useRecommendations({ cities: effectiveDestinations, type: "food", enabled: !!activeTrip });

  const googleSpots = useMemo(
    () => recommendedItems.map(recommendationToFoodSpot),
    [recommendedItems],
  );

  const selectedCities = useMemo(
    () => effectiveDestinations.map((id) => getCityById(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [effectiveDestinations],
  );

  // Convert DB spots to FoodSpot type
  const userSpots = useMemo(
    (): FoodSpot[] =>
      dbUserSpots.map((s) => ({
        id: s.id,
        name: s.name,
        nameJa: s.nameJa ?? s.name,
        category: (s.category ?? "other") as FoodCategory,
        area: s.area ?? "",
        address: s.address ?? "",
        addressJa: s.address ?? "",
        rating: s.rating ?? 0,
        priceRange: s.priceRange ?? "가격 미상",
        hours: s.hours ?? "영업시간 미등록",
        recommendedMenu: [],
        visited: false,
        lat: s.lat ?? undefined,
        lng: s.lng ?? undefined,
        googleRating: s.googleRating ?? undefined,
        googleReviewCount: s.googleReviewCount ?? undefined,
        placeId: s.placeId ?? undefined,
        mapUrl: s.mapUrl ?? undefined,
      })),
    [dbUserSpots]
  );

  const addedPlaceIds: Set<string> = useMemo(
    () => new Set<string>(userSpots.map((s) => s.placeId).filter((id): id is string => !!id)),
    [userSpots],
  );

  // 필터 함수
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

  const filteredCurated = useMemo(
    () => applyFilters(curatedSpots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, selectedCategory, searchQuery, curatedSpots],
  );
  const filteredGoogle = useMemo(
    () => applyFilters(googleSpots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, selectedCategory, searchQuery, googleSpots],
  );
  const filteredUser = useMemo(
    () => applyFilters(userSpots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, selectedCategory, searchQuery, userSpots],
  );

  if (tripLoading || spotsLoading) {
    return (
      <div className="px-4 py-6">
        <RecommendationSkeleton />
      </div>
    );
  }

  if (!activeTrip) {
    return <NoTripPrompt icon="🍜" />;
  }

  function handleDeleteUserSpot(id: string) {
    removeSpot(id);
  }

  function handleAddPlace(place: GooglePlaceResult) {
    const cityName = selectedCities[0]?.name ?? "오사카";
    const spot = placeToFoodSpot(place, cityName);
    if (addedPlaceIds.has(place.placeId)) return;
    createSpot({
      name: spot.name,
      nameJa: spot.nameJa,
      category: spot.category,
      area: spot.area,
      address: spot.address,
      addressJa: spot.addressJa,
      rating: spot.rating,
      priceRange: spot.priceRange,
      hours: spot.hours,
      placeId: spot.placeId,
      googleRating: spot.googleRating,
      googleReviewCount: spot.googleReviewCount,
      lat: spot.lat,
      lng: spot.lng,
      mapUrl: spot.mapUrl,
      visited: false,
      recommendedMenu: [],
    });
  }

  function handleCardClick(spot: FoodSpot) {
    setSelectedSpot(spot);
    setDetailDrawerOpen(true);
  }

  const cityLabel = selectedCities.map((c) => c.name).join(" · ");
  const totalCount = filteredCurated.length + filteredGoogle.length + filteredUser.length;

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
            <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setAddDrawerOpen(true)}>
              <Search className="h-3.5 w-3.5" />
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs">검색 추가</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {cityLabel ? `${cityLabel} 맛집 ${totalCount}개` : `맛집 ${totalCount}개`}
          </p>

          {selectedCities.length > 1 && (
            <Tabs value={selectedCity} onValueChange={setSelectedCity} className="mb-2">
              <TabsList className="flex h-auto gap-1 bg-transparent p-0 overflow-x-auto w-full justify-start">
                <TabsTrigger value="all" className="shrink-0 rounded-full border data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs px-3 py-1.5">
                  전체
                </TabsTrigger>
                {selectedCities.map((city) => (
                  <TabsTrigger key={city.id} value={city.id} className="shrink-0 rounded-full border data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs px-3 py-1.5">
                    {city.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FilterCategory)}>
            <TabsList className="flex h-auto gap-1 bg-transparent p-0 overflow-x-auto w-full justify-start">
              {CATEGORY_FILTERS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key} className="shrink-0 rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* 에디터 추천 (정적 데이터) */}
        {curatedSpots.length > 0 && (
          <FoodSection
            title="에디터 추천"
            badge={<Badge variant="outline" className="text-[10px]">직접 선정</Badge>}
            spots={filteredCurated}
            onCardClick={handleCardClick}
            emptyMessage="필터에 맞는 에디터 추천이 없습니다"
            emptyIcon="⭐"
          />
        )}

        {curatedSpots.length > 0 && <Separator />}

        {/* Google 추천 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">인기 맛집</h2>
              <Badge variant="outline" className="text-[10px]">Google 추천</Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={recRefresh} disabled={recLoading}>
              {recLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              새로고침
            </Button>
          </div>
          {recLoading ? (
            <RecommendationSkeleton />
          ) : (
            <FoodSection
              title=""
              spots={filteredGoogle}
              onCardClick={handleCardClick}
              emptyMessage="필터에 맞는 추천 맛집이 없습니다"
              emptyIcon="🍽"
            />
          )}
        </section>

        <Separator />

        {/* 내가 추가한 맛집 */}
        <FoodSection
          title="내가 추가한 맛집"
          badge={userSpots.length > 0 ? <span className="text-xs text-muted-foreground">{filteredUser.length}개</span> : undefined}
          spots={filteredUser}
          onCardClick={handleCardClick}
          onDelete={handleDeleteUserSpot}
          deletable
          emptyMessage="아직 추가한 맛집이 없어요. 검색 추가 버튼을 눌러보세요."
          emptyIcon="🔖"
          action={
            userSpots.length === 0 ? (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setAddDrawerOpen(true)}>
                <Plus className="h-3 w-3" /> 추가
              </Button>
            ) : undefined
          }
        />
      </div>

      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selectedSpot?.name ?? "맛집 상세"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
            {selectedSpot && <FoodDetail spot={selectedSpot} onClose={() => { setDetailDrawerOpen(false); setSelectedSpot(null); }} />}
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
