"use client";

import { useState, useMemo, useCallback } from "react";
import { Hotel, Search, Star, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HotelInfo } from "@/hooks/use-trip-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HotelSearchResult {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly phone?: string;
  readonly city: string;
}

interface HotelCardProps {
  hotel: HotelInfo | undefined;
  onSave: (hotel: HotelInfo) => void;
}

export function HotelCard({ hotel, onSave }: HotelCardProps) {
  const [name, setName] = useState(hotel?.name ?? "");
  const [nameJa, setNameJa] = useState(hotel?.nameJa ?? "");
  const [address, setAddress] = useState(hotel?.address ?? "");
  const [checkIn, setCheckIn] = useState(hotel?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(hotel?.checkOut ?? "");
  const [confirmationCode, setConfirmationCode] = useState(
    hotel?.confirmationCode ?? "",
  );
  const [phone, setPhone] = useState(hotel?.phone ?? "");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/hotel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      setSearchResults(data.results ?? []);
      setHasSearched(true);
    } catch {
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  function handleSelectHotel(result: HotelSearchResult) {
    setName(result.name);
    setNameJa(result.nameJa);
    setAddress(result.address);
    if (result.phone) setPhone(result.phone);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    toast.success(`${result.name} 정보가 자동 입력되었습니다`);
  }

  function handleSave() {
    if (!name || !address) {
      toast.error("호텔명과 주소를 입력해주세요");
      return;
    }
    onSave({
      name,
      ...(nameJa ? { nameJa } : {}),
      address,
      checkIn,
      checkOut,
      ...(confirmationCode ? { confirmationCode } : {}),
      ...(phone ? { phone } : {}),
    });
    toast.success("호텔 정보가 저장되었습니다");
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hotel className="h-4 w-4 text-amber-500" />
          숙박 정보
          {hotel?.name && (
            <Badge
              variant="secondary"
              className="ml-auto text-xs font-normal"
            >
              {hotel.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Saved hotel summary */}
        {hotel?.name && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">저장된 숙소</p>
            <p className="font-semibold text-sm">{hotel.name}</p>
            {hotel.nameJa && (
              <p className="text-xs text-muted-foreground">{hotel.nameJa}</p>
            )}
            <p className="text-xs text-muted-foreground">{hotel.address}</p>
            {(hotel.checkIn || hotel.checkOut) && (
              <p className="text-xs">
                체크인 {hotel.checkIn} / 체크아웃 {hotel.checkOut}
              </p>
            )}
          </div>
        )}

        {/* Hotel search */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            호텔 검색 (이름 또는 도시)
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="예: 도미인, 난바, 교토"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.placeId}
                  type="button"
                  onClick={() => handleSelectHotel(result)}
                  className="w-full flex items-start gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {result.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 shrink-0"
                      >
                        {result.city}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {result.nameJa}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{result.rating.toFixed(1)}</span>
                        <span>({result.reviewCount.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {hasSearched && searchResults.length === 0 && !isSearching && (
            <p className="text-xs text-muted-foreground text-center py-2">
              검색 결과가 없습니다. 직접 입력해주세요.
            </p>
          )}
        </div>

        {/* Manual input */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2">호텔 상세</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hotel-name">호텔명</Label>
              <Input
                id="hotel-name"
                placeholder="예: 도톤보리 호텔"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-name-ja">일본어 이름 (선택)</Label>
              <Input
                id="hotel-name-ja"
                placeholder="예: ドーミーイン"
                value={nameJa}
                onChange={(e) => setNameJa(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="hotel-address">주소</Label>
            <Input
              id="hotel-address"
              placeholder="예: 大阪市中央区..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="hotel-checkin">체크인</Label>
              <Input
                id="hotel-checkin"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-checkout">체크아웃</Label>
              <Input
                id="hotel-checkout"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="hotel-code">예약 번호 (선택)</Label>
              <Input
                id="hotel-code"
                placeholder="예: HT-12345"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-phone">전화번호 (선택)</Label>
              <Input
                id="hotel-phone"
                placeholder="예: 06-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave}>
          저장
        </Button>
      </CardContent>
    </Card>
  );
}
