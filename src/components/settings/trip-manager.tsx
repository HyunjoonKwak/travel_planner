"use client";

import { useState } from "react";
import { Plus, CheckCircle, Trash2, Radio, Pencil, Plane, Hotel, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Trip, UpdateTripInput } from "@/hooks/use-trip";
import type { FlightInfo, HotelInfo, BudgetConfig } from "@/hooks/use-trip-config";
import { TripEditor, type TripFormData } from "@/components/settings/trip-editor";

interface TripManagerProps {
  trips: Trip[];
  loading: boolean;
  activeTripId: string | null;
  onSwitch: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (data: TripFormData) => Promise<void>;
  onUpdate: (id: string, input: UpdateTripInput) => Promise<void>;
}

function safeJsonParse<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function TripSummaryBadges({ trip }: { trip: Trip }) {
  const hasFlight = !!(safeJsonParse<FlightInfo>(trip.outboundFlight)?.flightNumber);
  const hasHotel = !!(safeJsonParse<HotelInfo>(trip.hotel)?.name);
  const hasBudget = !!(safeJsonParse<BudgetConfig>(trip.budget)?.totalBudget);

  if (!hasFlight && !hasHotel && !hasBudget) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      {hasFlight && <Plane className="h-3 w-3 text-blue-500" />}
      {hasHotel && <Hotel className="h-3 w-3 text-amber-500" />}
      {hasBudget && <Wallet className="h-3 w-3 text-green-600" />}
    </div>
  );
}

function TripRow({
  trip,
  isActive,
  isEditing,
  onSwitch,
  onDelete,
  onEdit,
}: {
  trip: Trip;
  isActive: boolean;
  isEditing: boolean;
  onSwitch: () => void;
  onDelete: () => void;
  onEdit: () => void;
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
        isEditing ? "ring-2 ring-primary/30" : "",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isActive && <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />}
          <p className="text-sm font-medium truncate">{trip.name}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{dateRange}</p>
        <TripSummaryBadges trip={trip} />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isActive && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onSwitch}>
            <Radio className="h-3 w-3 mr-1" />
            활성화
          </Button>
        )}
        <Button
          size="sm"
          variant={isEditing ? "default" : "ghost"}
          className="h-7 w-7 p-0"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
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

export function TripManager({
  trips,
  loading,
  activeTripId,
  onSwitch,
  onDelete,
  onCreate,
  onUpdate,
}: TripManagerProps) {
  // editingId: null = no editor open, "new" = new trip form, trip.id = editing that trip
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTrip = editingId && editingId !== "new"
    ? (trips.find((t) => t.id === editingId) ?? null)
    : null;

  async function handleSave(data: TripFormData) {
    if (editingId === "new") {
      await onCreate(data);
      toast.success("새 여행이 만들어졌습니다");
    } else if (editingId) {
      await onUpdate(editingId, {
        name: data.name,
        country: data.country,
        destinations: data.destinations,
        theme: data.theme,
        startDate: data.startDate,
        endDate: data.endDate,
        outboundFlight: data.outboundFlight,
        returnFlight: data.returnFlight,
        hotel: data.hotel,
        budget: data.budget,
      });
      toast.success("여행 정보가 저장되었습니다");
    }
    setEditingId(null);
  }

  async function handleSwitch(id: string) {
    await onSwitch(id);
    toast.success("여행이 활성화되었습니다");
  }

  async function handleDelete(id: string) {
    await onDelete(id);
    if (editingId === id) setEditingId(null);
    toast.success("여행이 삭제되었습니다");
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          여행 관리
          {trips.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {trips.length}개
            </Badge>
          )}
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
              isEditing={editingId === trip.id}
              onSwitch={() => handleSwitch(trip.id)}
              onDelete={() => handleDelete(trip.id)}
              onEdit={() => setEditingId((prev) => (prev === trip.id ? null : trip.id))}
            />
          ))
        )}

        {/* New trip button */}
        {editingId !== "new" && (
          <Button
            variant="outline"
            className="w-full gap-2 mt-2"
            onClick={() => setEditingId("new")}
          >
            <Plus className="h-4 w-4" />
            새 여행 추가
          </Button>
        )}

        {/* Inline editor */}
        {editingId && (
          <>
            <Separator className="my-3" />
            <div className="pt-1">
              <p className="text-sm font-medium mb-3">
                {editingId === "new" ? "새 여행 만들기" : `"${editingTrip?.name ?? ""}" 편집`}
              </p>
              <TripEditor
                trip={editingId === "new" ? null : editingTrip}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
