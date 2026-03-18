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
import type { ScheduleItem } from "@/types/schedule";

const SAMPLE_SCHEDULE: ScheduleItem[] = [
  {
    id: "s1",
    date: "2025-04-01",
    startTime: "10:00",
    endTime: "12:00",
    title: "간사이 국제공항 도착",
    titleJa: "関西国際空港到着",
    location: "간사이 국제공항",
    category: "transport",
    transport: "공항 리무진버스",
    transportDuration: "60분",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s2",
    date: "2025-04-01",
    startTime: "13:00",
    endTime: "14:00",
    title: "도톤보리 점심",
    titleJa: "道頓堀ランチ",
    location: "도톤보리",
    locationJa: "道頓堀",
    category: "food",
    memo: "타코야키 꼭 먹기",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s3",
    date: "2025-04-01",
    startTime: "15:00",
    endTime: "18:00",
    title: "신사이바시 쇼핑",
    titleJa: "心斎橋ショッピング",
    location: "신사이바시",
    locationJa: "心斎橋",
    category: "shopping",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s4",
    date: "2025-04-02",
    startTime: "09:00",
    endTime: "12:00",
    title: "오사카성 관광",
    titleJa: "大阪城観光",
    location: "오사카성",
    locationJa: "大阪城",
    category: "sightseeing",
    transport: "지하철 타니마치선",
    transportDuration: "15분",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s5",
    date: "2025-04-02",
    startTime: "13:30",
    endTime: "15:00",
    title: "쿠로몬 시장",
    titleJa: "黒門市場",
    location: "쿠로몬 시장",
    locationJa: "黒門市場",
    category: "food",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s6",
    date: "2025-04-03",
    startTime: "10:00",
    endTime: "17:00",
    title: "유니버설 스튜디오 재팬",
    titleJa: "ユニバーサル・スタジオ・ジャパン",
    location: "USJ",
    category: "sightseeing",
    transport: "지하철 + JR 유메사키선",
    transportDuration: "30분",
    memo: "닌텐도 월드 꼭 가기!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s7",
    date: "2025-04-04",
    startTime: "11:00",
    endTime: "20:00",
    title: "아리마 온천",
    titleJa: "有馬温泉",
    location: "아리마 온천",
    locationJa: "有馬温泉",
    category: "sightseeing",
    transport: "JR + 신키 버스",
    transportDuration: "90분",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s8",
    date: "2025-04-05",
    startTime: "09:00",
    endTime: "11:00",
    title: "숙소 체크아웃",
    titleJa: "チェックアウト",
    location: "호텔",
    category: "accommodation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s9",
    date: "2025-04-05",
    startTime: "14:00",
    endTime: "16:00",
    title: "귀국 비행기",
    titleJa: "帰国",
    location: "간사이 국제공항",
    category: "transport",
    transport: "공항 리무진버스",
    transportDuration: "60분",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const TRIP_DATES = ["2025-04-01", "2025-04-02", "2025-04-03", "2025-04-04", "2025-04-05"];

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
  const [items, setItems] = useState<ScheduleItem[]>(SAMPLE_SCHEDULE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { config } = useTripConfig();

  const filteredItems = useMemo(() => {
    if (!selectedDate) return items;
    return items.filter((item) => item.date === selectedDate);
  }, [items, selectedDate]);

  const mapPlaces = useMemo(() => {
    const source = selectedDate ? filteredItems : items;
    return getUniquePlaces(source);
  }, [filteredItems, items, selectedDate]);

  const hasTravelInfo = !!(config.outboundFlight || config.returnFlight || config.hotel);

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

  return (
    <div className="relative min-h-screen pb-20">
      <Tabs defaultValue="calendar">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="calendar" className="flex-1">캘린더</TabsTrigger>
            <TabsTrigger value="list" className="flex-1">목록</TabsTrigger>
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
                  <HotelBar hotel={config.hotel} onAddToSchedule={handleAddItem} />
                )}
              </div>
            )}

            <CalendarStrip
              dates={TRIP_DATES}
              items={items}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {formatDateKo(selectedDate)} · {filteredItems.length}개 일정
              </p>
            )}

            <ScheduleList items={filteredItems} onEdit={openEdit} onDelete={handleDelete} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="px-4 py-4">
            <ScheduleList items={items} onEdit={openEdit} onDelete={handleDelete} />
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="px-4 py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? `${formatDateKo(selectedDate)} 위치`
                : `전체 일정 위치 (${mapPlaces.length}곳)`}
            </p>
            <ScheduleMap places={mapPlaces} />
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
            <DrawerTitle>{editingItem ? "일정 수정" : "일정 추가"}</DrawerTitle>
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
