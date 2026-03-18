"use client";

import { useState, useMemo } from "react";
import { Plus, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateKo } from "@/lib/utils/date";
import { ScheduleList } from "@/components/schedule/schedule-list";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { ScheduleMap } from "@/components/schedule/schedule-map";
import { CalendarStrip } from "@/components/schedule/calendar-strip";
import { FlightBar, HotelBar } from "@/components/schedule/travel-info-bar";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripSchedules } from "@/hooks/use-trip-data";
import { AIScheduleDrawer } from "@/components/schedule/ai-schedule-drawer";
import type { ScheduleItem } from "@/types/schedule";
import type { FlightInfo, HotelInfo } from "@/hooks/use-trip-config";
import { NoTripPrompt } from "@/components/common/no-trip-prompt";

function generateTripDates(start: string, end: string): string[] {
  if (!start || !end) return [];
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getUniquePlaces(items: ScheduleItem[]) {
  const seen = new Set<string>();
  return items
    .filter((item) => !!item.location)
    .filter((item) => {
      if (seen.has(item.location!)) return false;
      seen.add(item.location!);
      return true;
    })
    .map((item) => ({
      name: item.location!,
      address: item.locationJa,
      time: item.startTime,
    }));
}

function parseTripJson<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export default function SchedulePage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const { items: dbItems, create, update, remove, loading: scheduleLoading } =
    useTripSchedules(tripId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Cast DB items to local ScheduleItem type (fields are compatible)
  const items = dbItems as unknown as ScheduleItem[];

  const outboundFlight = parseTripJson<FlightInfo>(activeTrip?.outboundFlight);
  const returnFlight = parseTripJson<FlightInfo>(activeTrip?.returnFlight);
  const hotel = parseTripJson<HotelInfo>(activeTrip?.hotel);

  const tripDates = useMemo(
    () =>
      generateTripDates(
        activeTrip?.startDate ?? "",
        activeTrip?.endDate ?? "",
      ),
    [activeTrip?.startDate, activeTrip?.endDate],
  );

  const filteredItems = useMemo(() => {
    if (!selectedDate) return items;
    return items.filter((item) => item.date === selectedDate);
  }, [items, selectedDate]);

  const sortedItems = useMemo(
    () =>
      [...filteredItems].sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.startTime.localeCompare(b.startTime);
      }),
    [filteredItems],
  );

  const allSorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.startTime.localeCompare(b.startTime);
      }),
    [items],
  );

  const mapPlaces = useMemo(() => {
    const source = selectedDate ? sortedItems : allSorted;
    return getUniquePlaces(source);
  }, [sortedItems, allSorted, selectedDate]);

  const hasTravelInfo = !!(outboundFlight || returnFlight || hotel);

  async function handleAddItem(item: ScheduleItem) {
    await create(item);
    setDrawerOpen(false);
    setEditingItem(undefined);
  }

  async function handleEditItem(item: ScheduleItem) {
    await update(item.id, item);
    setDrawerOpen(false);
    setEditingItem(undefined);
  }

  async function handleDelete(id: string) {
    await remove(id);
  }

  function handleSubmit(data: ScheduleItem) {
    if (editingItem) {
      handleEditItem(data);
    } else {
      handleAddItem(data);
    }
  }

  async function handleAIApply(aiItems: ScheduleItem[]) {
    await Promise.all(aiItems.map((item) => create(item)));
  }

  function openAdd() {
    setEditingItem(undefined);
    setDrawerOpen(true);
  }

  function openEdit(item: ScheduleItem) {
    setEditingItem(item);
    setDrawerOpen(true);
  }

  if (tripLoading) {
    return (
      <div className="px-4 py-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!activeTrip) {
    return <NoTripPrompt />;
  }

  const hasNoDates = tripDates.length === 0;

  return (
    <div className="relative min-h-screen pb-20">
      <Tabs defaultValue="calendar">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="calendar" className="flex-1">
              캘린더
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1">
              목록
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 gap-1">
              <Map className="h-3.5 w-3.5" />
              지도
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="mt-0">
          <div className="px-4 py-4 space-y-3">
            {hasTravelInfo && (
              <div className="space-y-2">
                {outboundFlight && (
                  <FlightBar
                    flight={outboundFlight}
                    direction="outbound"
                    onAddToSchedule={handleAddItem}
                  />
                )}
                {returnFlight && (
                  <FlightBar
                    flight={returnFlight}
                    direction="return"
                    onAddToSchedule={handleAddItem}
                  />
                )}
                {hotel && (
                  <HotelBar hotel={hotel} onAddToSchedule={handleAddItem} />
                )}
              </div>
            )}

            {scheduleLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : hasNoDates ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm text-muted-foreground">
                  여행 날짜가 설정되지 않았습니다
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  설정에서 출발일/귀국일을 입력하면 캘린더가 표시됩니다
                </p>
              </div>
            ) : (
              <>
                <CalendarStrip
                  dates={tripDates}
                  items={items}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                {selectedDate && (
                  <p className="text-sm text-muted-foreground">
                    {formatDateKo(selectedDate)} · {sortedItems.length}개 일정
                  </p>
                )}

                <ScheduleList
                  items={sortedItems}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </>
            )}

            {items.length === 0 && !hasNoDates && !scheduleLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-3xl mb-2">✈️</p>
                <p className="text-sm text-muted-foreground">
                  아직 일정이 없어요
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  + 버튼으로 일정을 추가하세요
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="px-4 py-4">
            {scheduleLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : allSorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm text-muted-foreground">
                  등록된 일정이 없습니다
                </p>
              </div>
            ) : (
              <ScheduleList
                items={allSorted}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="px-4 py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? `${formatDateKo(selectedDate)} 위치`
                : `전체 일정 위치 (${mapPlaces.length}곳)`}
            </p>
            {mapPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                <p className="text-3xl mb-2">🗺</p>
                <p className="text-sm text-muted-foreground">
                  위치가 등록된 일정이 없습니다
                </p>
              </div>
            ) : (
              <ScheduleMap places={mapPlaces} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-20 right-4 z-20 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg bg-background"
          onClick={() => setAiDrawerOpen(true)}
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={openAdd}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingItem ? "일정 수정" : "일정 추가"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
            <ScheduleForm
              initialData={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
      <AIScheduleDrawer
        open={aiDrawerOpen}
        onOpenChange={setAiDrawerOpen}
        onApply={handleAIApply}
      />
    </div>
  );
}
