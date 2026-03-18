"use client";

import { useState, useMemo } from "react";
import { Plus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDateKo } from "@/lib/utils/date";
import { ScheduleList } from "@/components/schedule/schedule-list";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { ScheduleMap } from "@/components/schedule/schedule-map";
import { CalendarStrip } from "@/components/schedule/calendar-strip";
import { FlightBar, HotelBar } from "@/components/schedule/travel-info-bar";
import { useTripConfig } from "@/hooks/use-trip-config";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ScheduleItem } from "@/types/schedule";

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

export default function SchedulePage() {
  const [items, setItems] = useLocalStorage<ScheduleItem[]>(
    "travel-schedule",
    [],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { config } = useTripConfig();

  const tripDates = useMemo(
    () => generateTripDates(config.startDate, config.endDate),
    [config.startDate, config.endDate],
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

  const hasTravelInfo = !!(
    config.outboundFlight ||
    config.returnFlight ||
    config.hotel
  );

  function handleAddItem(item: ScheduleItem) {
    setItems((prev) => [...prev, item]);
    setDrawerOpen(false);
    setEditingItem(undefined);
  }

  function handleEditItem(item: ScheduleItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    setDrawerOpen(false);
    setEditingItem(undefined);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSubmit(data: ScheduleItem) {
    if (editingItem) {
      handleEditItem(data);
    } else {
      handleAddItem(data);
    }
  }

  function openAdd() {
    setEditingItem(undefined);
    setDrawerOpen(true);
  }

  function openEdit(item: ScheduleItem) {
    setEditingItem(item);
    setDrawerOpen(true);
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
                {config.outboundFlight && (
                  <FlightBar
                    flight={config.outboundFlight}
                    direction="outbound"
                    onAddToSchedule={handleAddItem}
                  />
                )}
                {config.returnFlight && (
                  <FlightBar
                    flight={config.returnFlight}
                    direction="return"
                    onAddToSchedule={handleAddItem}
                  />
                )}
                {config.hotel && (
                  <HotelBar
                    hotel={config.hotel}
                    onAddToSchedule={handleAddItem}
                  />
                )}
              </div>
            )}

            {hasNoDates ? (
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

            {items.length === 0 && !hasNoDates && (
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
            {allSorted.length === 0 ? (
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

      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
        onClick={openAdd}
      >
        <Plus className="h-6 w-6" />
      </Button>

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
    </div>
  );
}
