"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTrips, type UpdateTripInput } from "@/hooks/use-trip";
import { cn } from "@/lib/utils";
import { TripManager } from "@/components/settings/trip-manager";
import type { TripFormData } from "@/components/settings/trip-editor";

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();

  const activeTrip = useMemo(
    () => trips.find((t) => t.isActive === 1) ?? trips[0] ?? null,
    [trips],
  );

  async function handleSwitch(id: string) {
    await Promise.all(
      trips.map((t) => updateTrip(t.id, { isActive: t.id === id ? 1 : 0 })),
    );
  }

  async function handleUpdate(id: string, input: UpdateTripInput) {
    await updateTrip(id, input);
  }

  async function handleCreate(data: TripFormData) {
    const created = await createTrip({
      name: data.name,
      country: data.country,
      destinations: data.destinations,
      theme: data.theme,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    // If there are flight/hotel/budget data, save them too
    if (created && (data.outboundFlight || data.returnFlight || data.hotel || data.budget)) {
      await updateTrip(created.id, {
        outboundFlight: data.outboundFlight,
        returnFlight: data.returnFlight,
        hotel: data.hotel,
        budget: data.budget,
      });
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">설정</h1>
      </div>

      <div className="px-4 space-y-4">
        <TripManager
          trips={trips}
          loading={loading}
          activeTripId={activeTrip?.id ?? null}
          onSwitch={handleSwitch}
          onDelete={async (id) => { await deleteTrip(id); }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />

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
          <p className="text-sm font-medium">{activeTrip?.name ?? "여행 플래너"}</p>
          <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
