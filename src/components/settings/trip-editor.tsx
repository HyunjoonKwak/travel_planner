"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plane, Hotel, Wallet, MapPin, Search, Loader2, ArrowRightLeft, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { FlightInfo, HotelInfo, BudgetConfig } from "@/hooks/use-trip-config";
import type { Trip } from "@/hooks/use-trip";
import { DestinationSelector } from "@/components/settings/destination-selector";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { searchFlights, type FlightRoute } from "@/lib/data/flights";
import { getCityById } from "@/lib/data/destinations";
import { jpyToKrw, krwToJpy } from "@/lib/utils/currency";

export interface TripFormData {
  name: string;
  country: string;
  destinations: string[];
  theme: string;
  startDate: string;
  endDate: string;
  outboundFlight?: FlightInfo;
  returnFlight?: FlightInfo;
  hotel?: HotelInfo;
  budget?: BudgetConfig;
}

interface TripEditorProps {
  trip: Trip | null;
  onSave: (data: TripFormData) => Promise<void>;
  onCancel: () => void;
}

function safeJsonParse<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function buildName(destinations: string[], theme: string): string {
  const cityNames = destinations
    .map((id) => getCityById(id)?.name)
    .filter(Boolean)
    .join("·");
  if (cityNames && theme) return `${cityNames} ${theme}`;
  if (cityNames) return `${cityNames} 여행`;
  if (theme) return `${theme} 여행`;
  return "새 여행";
}

// ─── Flight Section ────────────────────────────────────────────────────────────

interface FlightSectionProps {
  label: string;
  prefix: string;
  value: FlightInfo | undefined;
  onChange: (f: FlightInfo | undefined) => void;
}

function FlightSection({ label, prefix, value, onChange }: FlightSectionProps) {
  const [open, setOpen] = useState(false);
  const [airline, setAirline] = useState(value?.airline ?? "");
  const [flightNumber, setFlightNumber] = useState(value?.flightNumber ?? "");
  const [departureAirport, setDepartureAirport] = useState(value?.departureAirport ?? "");
  const [arrivalAirport, setArrivalAirport] = useState(value?.arrivalAirport ?? "");
  const [date, setDate] = useState(value?.date ?? "");
  const [departureTime, setDepartureTime] = useState(value?.departureTime ?? "");
  const [arrivalTime, setArrivalTime] = useState(value?.arrivalTime ?? "");
  const [confirmationCode, setConfirmationCode] = useState(value?.confirmationCode ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(!value?.flightNumber);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchFlights(searchQuery).slice(0, 6);
  }, [searchQuery]);

  function handleSelectRoute(route: FlightRoute) {
    setAirline(route.airline);
    setFlightNumber(route.flightNumber);
    setDepartureAirport(route.departureAirport);
    setArrivalAirport(route.arrivalAirport);
    setDepartureTime(route.departureTime);
    setArrivalTime(route.arrivalTime);
    setSearchQuery("");
    setShowSearch(false);
    onChange({
      airline: route.airline,
      flightNumber: route.flightNumber,
      departureAirport: route.departureAirport,
      arrivalAirport: route.arrivalAirport,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      date,
      ...(confirmationCode ? { confirmationCode } : {}),
    });
    toast.success(`${route.flightNumber} 자동 입력됨`);
  }

  function handleFieldChange(field: keyof FlightInfo, val: string) {
    const updated: FlightInfo = {
      airline: field === "airline" ? val : airline,
      flightNumber: field === "flightNumber" ? val : flightNumber,
      departureAirport: field === "departureAirport" ? val : departureAirport,
      arrivalAirport: field === "arrivalAirport" ? val : arrivalAirport,
      date: field === "date" ? val : date,
      departureTime: field === "departureTime" ? val : departureTime,
      arrivalTime: field === "arrivalTime" ? val : arrivalTime,
      ...(confirmationCode || (field === "confirmationCode" && val)
        ? { confirmationCode: field === "confirmationCode" ? val : confirmationCode }
        : {}),
    };
    if (field === "airline") setAirline(val);
    else if (field === "flightNumber") setFlightNumber(val);
    else if (field === "departureAirport") setDepartureAirport(val);
    else if (field === "arrivalAirport") setArrivalAirport(val);
    else if (field === "date") setDate(val);
    else if (field === "departureTime") setDepartureTime(val);
    else if (field === "arrivalTime") setArrivalTime(val);
    else if (field === "confirmationCode") setConfirmationCode(val);
    onChange(updated);
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {value?.flightNumber && (
            <Badge variant="secondary" className="text-xs">
              {value.flightNumber} {value.departureAirport}→{value.arrivalAirport}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-2 pb-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">편명으로 검색</Label>
              {!showSearch && (
                <button type="button" onClick={() => setShowSearch(true)} className="text-xs text-primary hover:underline">
                  다시 검색
                </button>
              )}
            </div>
            {showSearch && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="편명 입력 (예: OZ111, KE723)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {suggestions.map((route) => (
                      <button
                        key={route.flightNumber}
                        type="button"
                        onClick={() => handleSelectRoute(route)}
                        className="w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{route.flightNumber}</span>
                            <span className="text-xs text-muted-foreground">{route.airline}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {route.departureAirport} → {route.arrivalAirport} {route.departureTime}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && suggestions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-1">결과 없음. 직접 입력해주세요.</p>
                )}
              </>
            )}
          </div>
          <div className="border-t pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-airline`}>항공사</Label>
                <Input id={`${prefix}-airline`} placeholder="아시아나항공" value={airline} onChange={(e) => handleFieldChange("airline", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-flightNumber`}>편명</Label>
                <Input id={`${prefix}-flightNumber`} placeholder="OZ123" value={flightNumber} onChange={(e) => handleFieldChange("flightNumber", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-dep`}>출발 공항</Label>
                <Input id={`${prefix}-dep`} placeholder="ICN" value={departureAirport} onChange={(e) => handleFieldChange("departureAirport", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-arr`}>도착 공항</Label>
                <Input id={`${prefix}-arr`} placeholder="KIX" value={arrivalAirport} onChange={(e) => handleFieldChange("arrivalAirport", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${prefix}-date`}>날짜</Label>
              <Input id={`${prefix}-date`} type="date" value={date} onChange={(e) => handleFieldChange("date", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-depTime`}>출발 시각</Label>
                <Input id={`${prefix}-depTime`} type="time" value={departureTime} onChange={(e) => handleFieldChange("departureTime", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${prefix}-arrTime`}>도착 시각</Label>
                <Input id={`${prefix}-arrTime`} type="time" value={arrivalTime} onChange={(e) => handleFieldChange("arrivalTime", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${prefix}-code`}>예약 번호 (선택)</Label>
              <Input id={`${prefix}-code`} placeholder="ABC123" value={confirmationCode} onChange={(e) => handleFieldChange("confirmationCode", e.target.value)} />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Budget helpers ────────────────────────────────────────────────────────────

const DEFAULT_RATIOS = { food: 0.4, transport: 0.15, shopping: 0.2, accommodation: 0.1, sightseeing: 0.1, other: 0.05 };
const CATEGORY_META = [
  { key: "food" as const, label: "식비", icon: "🍽" },
  { key: "transport" as const, label: "교통", icon: "🚇" },
  { key: "shopping" as const, label: "쇼핑", icon: "🛍" },
  { key: "accommodation" as const, label: "숙박", icon: "🏨" },
  { key: "sightseeing" as const, label: "관광", icon: "🎫" },
  { key: "other" as const, label: "기타", icon: "📌" },
];

type Categories = BudgetConfig["categories"];

// ─── TripEditor ────────────────────────────────────────────────────────────────

export function TripEditor({ trip, onSave, onCancel }: TripEditorProps) {
  // Basic info
  const [country, setCountry] = useState(trip?.country ?? "japan");
  const [destinations, setDestinations] = useState<ReadonlyArray<string>>(
    safeJsonParse<string[]>(trip?.destinations) ?? [],
  );
  const [theme, setTheme] = useState(trip?.theme ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");

  // Flight
  const [outboundFlight, setOutboundFlight] = useState<FlightInfo | undefined>(
    safeJsonParse<FlightInfo>(trip?.outboundFlight),
  );
  const [returnFlight, setReturnFlight] = useState<FlightInfo | undefined>(
    safeJsonParse<FlightInfo>(trip?.returnFlight),
  );

  // Hotel
  const [hotelName, setHotelName] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.name ?? "");
  const [hotelNameJa, setHotelNameJa] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.nameJa ?? "");
  const [hotelAddress, setHotelAddress] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.address ?? "");
  const [checkIn, setCheckIn] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.checkOut ?? "");
  const [hotelCode, setHotelCode] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.confirmationCode ?? "");
  const [hotelPhone, setHotelPhone] = useState(safeJsonParse<HotelInfo>(trip?.hotel)?.phone ?? "");
  const [hotelSearch, setHotelSearch] = useState("");
  const [hotelResults, setHotelResults] = useState<Array<{ placeId: string; name: string; nameJa: string; address: string; phone?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Budget
  const savedBudget = safeJsonParse<BudgetConfig>(trip?.budget);
  const [inputCurrency, setInputCurrency] = useState<"JPY" | "KRW">("JPY");
  const [totalJpy, setTotalJpy] = useState(savedBudget?.totalBudget ?? 0);
  const [categories, setCategories] = useState<Categories>(
    savedBudget?.categories ?? { food: 0, transport: 0, shopping: 0, accommodation: 0, sightseeing: 0, other: 0 },
  );

  const [saving, setSaving] = useState(false);

  // Hotel search
  const handleHotelSearch = useCallback(async () => {
    if (hotelSearch.trim().length < 2) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/hotel/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: hotelSearch.trim() }),
      });
      const data = await res.json();
      setHotelResults(data.results ?? []);
      setHasSearched(true);
    } catch {
      setHotelResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [hotelSearch]);

  function handleSelectHotel(result: { name: string; nameJa: string; address: string; phone?: string }) {
    setHotelName(result.name);
    setHotelNameJa(result.nameJa);
    setHotelAddress(result.address);
    if (result.phone) setHotelPhone(result.phone);
    setHotelSearch("");
    setHotelResults([]);
    setHasSearched(false);
    toast.success(`${result.name} 정보가 자동 입력되었습니다`);
  }

  // Budget helpers
  const displayTotal = inputCurrency === "JPY" ? totalJpy : jpyToKrw(totalJpy);
  const convertedTotal = inputCurrency === "JPY" ? jpyToKrw(totalJpy) : totalJpy;
  const inputSymbol = inputCurrency === "JPY" ? "¥" : "₩";
  const convertedSymbol = inputCurrency === "JPY" ? "₩" : "¥";

  function handleTotalChange(value: number) {
    const jpyVal = inputCurrency === "JPY" ? value : krwToJpy(value);
    setTotalJpy(jpyVal);
    if (jpyVal > 0) {
      setCategories({
        food: Math.round(jpyVal * DEFAULT_RATIOS.food),
        transport: Math.round(jpyVal * DEFAULT_RATIOS.transport),
        shopping: Math.round(jpyVal * DEFAULT_RATIOS.shopping),
        accommodation: Math.round(jpyVal * DEFAULT_RATIOS.accommodation),
        sightseeing: Math.round(jpyVal * DEFAULT_RATIOS.sightseeing),
        other: Math.round(jpyVal * DEFAULT_RATIOS.other),
      });
    }
  }

  function handleCategoryChange(key: keyof Categories, val: number) {
    const jpyVal = inputCurrency === "JPY" ? val : krwToJpy(val);
    setCategories((prev) => ({ ...prev, [key]: jpyVal }));
  }

  const allocated = Object.values(categories).reduce((a, b) => a + b, 0);
  const unallocatedJpy = totalJpy - allocated;
  const unallocatedDisplay = inputCurrency === "JPY" ? unallocatedJpy : jpyToKrw(unallocatedJpy);

  // Save all
  async function handleSave() {
    setSaving(true);
    try {
      const name = buildName([...destinations], theme) || trip?.name || "새 여행";
      const hotel: HotelInfo | undefined = hotelName
        ? {
            name: hotelName,
            ...(hotelNameJa ? { nameJa: hotelNameJa } : {}),
            address: hotelAddress,
            checkIn,
            checkOut,
            ...(hotelCode ? { confirmationCode: hotelCode } : {}),
            ...(hotelPhone ? { phone: hotelPhone } : {}),
          }
        : undefined;
      const budget: BudgetConfig | undefined = totalJpy > 0
        ? { totalBudget: totalJpy, categories }
        : undefined;

      await onSave({
        name,
        country,
        destinations: [...destinations],
        theme,
        startDate,
        endDate,
        outboundFlight,
        returnFlight,
        hotel,
        budget,
      });
    } finally {
      setSaving(false);
    }
  }

  const preview = buildName([...destinations], theme);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic" className="text-xs">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            기본정보
          </TabsTrigger>
          <TabsTrigger value="flight" className="text-xs">
            <Plane className="h-3.5 w-3.5 mr-1" />
            항공편
          </TabsTrigger>
          <TabsTrigger value="hotel" className="text-xs">
            <Hotel className="h-3.5 w-3.5 mr-1" />
            숙소
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">
            <Wallet className="h-3.5 w-3.5 mr-1" />
            예산
          </TabsTrigger>
        </TabsList>

        {/* 기본정보 탭 */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <DestinationSelector
            country={country}
            destinations={destinations}
            onCountryChange={setCountry}
            onDestinationsChange={setDestinations}
          />
          <ThemeSelector value={theme} onChange={setTheme} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editor-start">출발일</Label>
              <Input id="editor-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editor-end">귀국일</Label>
              <Input id="editor-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          {preview && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground">미리보기</p>
              <p className="font-semibold text-primary mt-1">{preview}</p>
            </div>
          )}
        </TabsContent>

        {/* 항공편 탭 */}
        <TabsContent value="flight" className="space-y-1 pt-4">
          <FlightSection label="가는 편" prefix="out" value={outboundFlight} onChange={setOutboundFlight} />
          <Separator />
          <FlightSection label="오는 편" prefix="ret" value={returnFlight} onChange={setReturnFlight} />
        </TabsContent>

        {/* 숙소 탭 */}
        <TabsContent value="hotel" className="space-y-3 pt-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">호텔 검색</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="예: 도미인, 난바, 교토"
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleHotelSearch(); }}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleHotelSearch} disabled={isSearching || hotelSearch.trim().length < 2}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {hotelResults.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {hotelResults.map((r) => (
                  <button
                    key={r.placeId}
                    type="button"
                    onClick={() => handleSelectHotel(r)}
                    className="w-full flex items-start gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.nameJa}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {hasSearched && hotelResults.length === 0 && !isSearching && (
              <p className="text-xs text-muted-foreground text-center py-1">결과 없음. 직접 입력해주세요.</p>
            )}
          </div>
          <div className="border-t pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="h-name">호텔명</Label>
                <Input id="h-name" placeholder="도톤보리 호텔" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="h-name-ja">일본어 이름 (선택)</Label>
                <Input id="h-name-ja" placeholder="ドーミーイン" value={hotelNameJa} onChange={(e) => setHotelNameJa(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="h-address">주소</Label>
              <Input id="h-address" placeholder="大阪市中央区..." value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="h-checkin">체크인</Label>
                <Input id="h-checkin" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="h-checkout">체크아웃</Label>
                <Input id="h-checkout" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="h-code">예약 번호 (선택)</Label>
                <Input id="h-code" placeholder="HT-12345" value={hotelCode} onChange={(e) => setHotelCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="h-phone">전화번호 (선택)</Label>
                <Input id="h-phone" placeholder="06-1234-5678" value={hotelPhone} onChange={(e) => setHotelPhone(e.target.value)} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 예산 탭 */}
        <TabsContent value="budget" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="budget-total">총 예산</Label>
              <button
                type="button"
                onClick={() => setInputCurrency((p) => (p === "JPY" ? "KRW" : "JPY"))}
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 rounded-full border border-green-300 px-2.5 py-1"
              >
                <ArrowRightLeft className="h-3 w-3" />
                {inputCurrency === "JPY" ? "엔화 (JPY)" : "원화 (KRW)"}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{inputSymbol}</span>
              <Input
                id="budget-total"
                type="number"
                placeholder={inputCurrency === "JPY" ? "300000" : "2670000"}
                value={displayTotal || ""}
                onChange={(e) => handleTotalChange(Number(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
            {totalJpy > 0 && (
              <p className="text-xs text-muted-foreground">
                ≈ {convertedSymbol}{convertedTotal.toLocaleString()}
                <span className="ml-2 text-muted-foreground/60">(1¥ ≈ ₩8.9)</span>
              </p>
            )}
          </div>
          {totalJpy > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">카테고리별 예산 ({inputSymbol})</p>
              {CATEGORY_META.map(({ key, label, icon }) => {
                const jpyVal = categories[key];
                const displayVal = inputCurrency === "JPY" ? jpyVal : jpyToKrw(jpyVal);
                const percent = totalJpy > 0 ? Math.min((jpyVal / totalJpy) * 100, 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1.5"><span>{icon}</span>{label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{inputSymbol}</span>
                        <Input
                          type="number"
                          className="w-28 h-7 text-right text-xs"
                          value={displayVal || ""}
                          onChange={(e) => handleCategoryChange(key, Number(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                );
              })}
              <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">미배분</span>
                <span className={unallocatedJpy < 0 ? "text-xs font-semibold text-destructive" : "text-xs font-semibold text-green-600"}>
                  {inputSymbol}{unallocatedDisplay.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" />
          취소
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "전체 저장"}
        </Button>
      </div>
    </div>
  );
}
