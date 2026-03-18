"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Trash2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTripConfig } from "@/hooks/use-trip-config";
import type { FlightInfo, HotelInfo, BudgetConfig } from "@/hooks/use-trip-config";
import { getCityById } from "@/lib/data/destinations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FlightCard } from "@/components/settings/flight-card";
import { HotelCard } from "@/components/settings/hotel-card";
import { BudgetCard } from "@/components/settings/budget-card";
import { DestinationSelector } from "@/components/settings/destination-selector";
import { ThemeSelector } from "@/components/settings/theme-selector";

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

function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-80 mx-4">
        <CardHeader>
          <CardTitle className="text-base">모든 데이터 삭제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            일기, 체크리스트, 예산 등 모든 데이터가 삭제됩니다. 이 작업은
            되돌릴 수 없어요.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
            >
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { config, updateConfig, getTripName } = useTripConfig();

  const [country, setCountry] = useState(config.country);
  const [destinations, setDestinations] = useState<ReadonlyArray<string>>(
    config.destinations,
  );
  const [tripTheme, setTripTheme] = useState(config.theme);
  const [startDate, setStartDate] = useState(config.startDate);
  const [endDate, setEndDate] = useState(config.endDate);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleTripSave() {
    updateConfig({
      country,
      destinations,
      theme: tripTheme,
      startDate,
      endDate,
      onboarded: true,
    });
    toast.success("여행 정보가 저장되었습니다");
  }

  function handleSaveOutbound(flight: FlightInfo) {
    updateConfig({ outboundFlight: flight });
  }

  function handleSaveReturn(flight: FlightInfo) {
    updateConfig({ returnFlight: flight });
  }

  function handleSaveHotel(hotel: HotelInfo) {
    updateConfig({ hotel });
  }

  function handleSaveBudget(budget: BudgetConfig) {
    updateConfig({ budget });
  }

  function handleClearAll() {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    setShowConfirm(false);
    window.location.reload();
  }

  const preview = buildPreviewName(destinations, tripTheme);

  return (
    <div className="min-h-screen pb-10">
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleClearAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">설정</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Trip Info */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="h-4 w-4 text-primary" />
              여행 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Destination selector */}
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
          </CardContent>
        </Card>

        {/* Flight Info */}
        <FlightCard
          outboundFlight={config.outboundFlight}
          returnFlight={config.returnFlight}
          onSaveOutbound={handleSaveOutbound}
          onSaveReturn={handleSaveReturn}
        />

        {/* Hotel Info */}
        <HotelCard hotel={config.hotel} onSave={handleSaveHotel} />

        {/* Budget */}
        <BudgetCard budget={config.budget} onSave={handleSaveBudget} />

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

        {/* Data management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">데이터 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              모든 로컬 데이터(일기, 체크리스트, 예산, 여행 설정)를
              초기화합니다.
            </p>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              모든 데이터 삭제
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <div className="text-center space-y-1 py-2">
          <p className="text-sm font-medium">{getTripName()}</p>
          <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
