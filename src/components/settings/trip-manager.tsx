"use client";

import { useState } from "react";
import { Plus, CheckCircle, Trash2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Trip, CreateTripInput } from "@/hooks/use-trip";
import { DestinationSelector } from "@/components/settings/destination-selector";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { getCityById } from "@/lib/data/destinations";

interface TripManagerProps {
  trips: Trip[];
  loading: boolean;
  activeTripId: string | null;
  onSwitch: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (input: CreateTripInput) => Promise<void>;
}

function buildTripName(
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
  return "새 여행";
}

function TripRow({
  trip,
  isActive,
  onSwitch,
  onDelete,
}: {
  trip: Trip;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  }

  const dateRange =
    trip.startDate && trip.endDate
      ? `${trip.startDate} ~ ${trip.endDate}`
      : "날짜 미설정";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        isActive ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isActive && (
            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <p className="text-sm font-medium truncate">{trip.name}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{dateRange}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isActive && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onSwitch}>
            <Radio className="h-3 w-3 mr-1" />
            활성화
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function NewTripForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: CreateTripInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [country, setCountry] = useState("japan");
  const [destinations, setDestinations] = useState<ReadonlyArray<string>>([]);
  const [theme, setTheme] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const name = buildTripName(destinations, theme);
    setSaving(true);
    await onSubmit({
      name,
      country,
      destinations: [...destinations],
      theme,
      startDate,
      endDate,
    });
    setSaving(false);
  }

  return (
    <div className="space-y-3 pt-2 border-t mt-2">
      <p className="text-sm font-medium">새 여행 만들기</p>

      <DestinationSelector
        country={country}
        destinations={destinations}
        onCountryChange={setCountry}
        onDestinationsChange={setDestinations}
      />

      <ThemeSelector value={theme} onChange={setTheme} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-start">출발일</Label>
          <Input
            id="new-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-end">귀국일</Label>
          <Input
            id="new-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button className="flex-1" onClick={handleCreate} disabled={saving}>
          만들기
        </Button>
      </div>
    </div>
  );
}

export function TripManager({
  trips,
  loading,
  activeTripId,
  onSwitch,
  onDelete,
  onCreate,
}: TripManagerProps) {
  const [showNewForm, setShowNewForm] = useState(false);

  async function handleCreate(input: CreateTripInput) {
    await onCreate(input);
    setShowNewForm(false);
    toast.success("새 여행이 만들어졌습니다");
  }

  async function handleSwitch(id: string) {
    await onSwitch(id);
    toast.success("여행이 활성화되었습니다");
  }

  async function handleDelete(id: string) {
    await onDelete(id);
    toast.success("여행이 삭제되었습니다");
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          여행 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <>
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            아직 여행이 없어요. 아래에서 만들어보세요.
          </p>
        ) : (
          trips.map((trip) => (
            <TripRow
              key={trip.id}
              trip={trip}
              isActive={trip.id === activeTripId}
              onSwitch={() => handleSwitch(trip.id)}
              onDelete={() => handleDelete(trip.id)}
            />
          ))
        )}

        {showNewForm ? (
          <NewTripForm
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
          />
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 mt-2"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-4 w-4" />
            새 여행 만들기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
