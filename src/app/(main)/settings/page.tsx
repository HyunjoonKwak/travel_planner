"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTrips, type UpdateTripInput } from "@/hooks/use-trip";
import type { FlightInfo, HotelInfo, BudgetConfig } from "@/hooks/use-trip-config";
import { getCityById } from "@/lib/data/destinations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FlightCard } from "@/components/settings/flight-card";
import { HotelCard } from "@/components/settings/hotel-card";
import { BudgetCard } from "@/components/settings/budget-card";
import { DestinationSelector } from "@/components/settings/destination-selector";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { TripManager } from "@/components/settings/trip-manager";

const APP_VERSION = "1.0.0";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: {
  value: ThemeOption;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "라이트", Icon: Sun },
  { value: "dark", label: "다크", Icon: Moon },
  { value: "system", label: "시스템", Icon: Laptop },
];

function buildPreviewName(
  destinations: ReadonlyArray<string>,
  theme: string,
): string {
  const cityNames = destinations
    .map((id) => getCityById(id)?.name)
    .filter(Boolean)
    .join("·");

  if (cityNames && theme) return `${cityNames} ${theme}`;
  if (cityNames) return `${cityNames} 여행`;
  if (theme) return `${theme} 여행`;
  return "";
}

function parseTripJson<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();

  const activeTrip = useMemo(
    () => trips.find((t) => t.isActive === 1) ?? trips[0] ?? null,
    [trips],
  );

  // Trip info form state - initialized from active trip
  const [country, setCountry] = useState(activeTrip?.country ?? "");
  const [destinations, setDestinations] = useState<ReadonlyArray<string>>(
    parseTripJson<string[]>(activeTrip?.destinations) ?? [],
  );
  const [tripTheme, setTripTheme] = useState(activeTrip?.theme ?? "");
  const [startDate, setStartDate] = useState(activeTrip?.startDate ?? "");
  const [endDate, setEndDate] = useState(activeTrip?.endDate ?? "");

  // Derived values from active trip for flight/hotel/budget
  const outboundFlight = parseTripJson<FlightInfo>(activeTrip?.outboundFlight);
  const returnFlight = parseTripJson<FlightInfo>(activeTrip?.returnFlight);
  const hotel = parseTripJson<HotelInfo>(activeTrip?.hotel);
  const budget = parseTripJson<BudgetConfig>(activeTrip?.budget);

  async function handleTripSave() {
    if (!activeTrip) {
      // Auto-create trip on first save
      const name = buildPreviewName(destinations, tripTheme) || "내 여행";
      const created = await createTrip({
        name,
        country,
        destinations: [...destinations],
        theme: tripTheme,
        startDate,
        endDate,
      });
      if (created) {
        toast.success("여행 정보가 저장되었습니다");
      } else {
        toast.error("저장에 실패했습니다");
      }
      return;
    }

    const name = buildPreviewName(destinations, tripTheme) || activeTrip.name;
    const result = await updateTrip(activeTrip.id, {
      name,
      country,
      destinations: [...destinations],
      theme: tripTheme,
      startDate,
      endDate,
    });
    if (result) {
      toast.success("여행 정보가 저장되었습니다");
    } else {
      toast.error("저장에 실패했습니다");
    }
  }

  async function handleUpdate(updates: UpdateTripInput) {
    if (!activeTrip) {
      toast.error("활성화된 여행이 없습니다");
      return;
    }
    const result = await updateTrip(activeTrip.id, updates);
    if (!result) {
      toast.error("저장에 실패했습니다");
    }
  }

  async function handleSaveOutbound(flight: FlightInfo) {
    await handleUpdate({ outboundFlight: flight });
    toast.success("가는 편 항공편이 저장되었습니다");
  }

  async function handleSaveReturn(flight: FlightInfo) {
    await handleUpdate({ returnFlight: flight });
    toast.success("오는 편 항공편이 저장되었습니다");
  }

  async function handleSaveHotel(hotelData: HotelInfo) {
    await handleUpdate({ hotel: hotelData });
    toast.success("호텔 정보가 저장되었습니다");
  }

  async function handleSaveBudget(budgetData: BudgetConfig) {
    await handleUpdate({ budget: budgetData });
  }

  async function handleSwitch(id: string) {
    await Promise.all(
      trips.map((t) => updateTrip(t.id, { isActive: t.id === id ? 1 : 0 })),
    );
  }

  async function handleDelete(id: string) {
    await deleteTrip(id);
  }

  async function handleCreate(input: {
    name: string;
    country?: string;
    destinations?: string[];
    theme?: string;
    startDate?: string;
    endDate?: string;
  }) {
    await createTrip(input);
  }

  const preview = buildPreviewName(destinations, tripTheme);
  const tripName = activeTrip?.name ?? "여행 플래너";

  return (
    <div className="min-h-screen pb-10">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">설정</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Trip Manager - TOP */}
        <TripManager
          trips={trips}
          loading={loading}
          activeTripId={activeTrip?.id ?? null}
          onSwitch={handleSwitch}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />

        {/* Trip Info */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="h-4 w-4 text-primary" />
              여행 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <DestinationSelector
                  country={country}
                  destinations={destinations}
                  onCountryChange={setCountry}
                  onDestinationsChange={setDestinations}
                />

                <ThemeSelector value={tripTheme} onChange={setTripTheme} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date">출발일</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date">귀국일</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {preview && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <p className="text-xs text-muted-foreground">미리보기</p>
                    <p className="font-semibold text-primary mt-1">{preview}</p>
                  </div>
                )}

                <Button className="w-full" onClick={handleTripSave}>
                  저장
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Flight Info */}
        <FlightCard
          outboundFlight={outboundFlight}
          returnFlight={returnFlight}
          onSaveOutbound={handleSaveOutbound}
          onSaveReturn={handleSaveReturn}
        />

        {/* Hotel Info */}
        <HotelCard hotel={hotel} onSave={handleSaveHotel} />

        {/* Budget */}
        <BudgetCard budget={budget} onSave={handleSaveBudget} />

        {/* Theme */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">테마</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 flex-1 transition-colors",
                    theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="text-center space-y-1 py-2">
          <p className="text-sm font-medium">{tripName}</p>
          <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
