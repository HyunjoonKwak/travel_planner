"use client";

import { useState } from "react";
import { Search, Loader2, Star, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { GooglePlaceResult } from "@/types/food-search";
import { cn } from "@/lib/utils";

interface AttractionSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedPlaceIds: Set<string>;
  onAdd: (place: GooglePlaceResult) => void;
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

export function AttractionSearchDrawer({
  open,
  onOpenChange,
  addedPlaceIds,
  onAdd,
}: AttractionSearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    ReadonlyArray<GooglePlaceResult>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/food/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${searchQuery.trim()} 관광` }),
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

  function handleClose() {
    onOpenChange(false);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
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
                  <div className="flex items-start gap-3 py-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-14 shrink-0" />
                  </div>
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
                    onAdd={onAdd}
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
            <Button variant="outline" className="w-full" onClick={handleClose}>
              닫기
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
