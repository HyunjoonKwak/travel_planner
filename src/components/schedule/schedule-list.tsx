"use client";

import { useState, useMemo } from "react";
import { MapPin, Clock, Train, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { formatDateKo } from "@/lib/utils/date";
import type { ScheduleItem } from "@/types/schedule";
import { SCHEDULE_CATEGORY_CONFIG } from "@/types/schedule";
import { ScheduleMap } from "@/components/schedule/schedule-map";

interface ScheduleListProps {
  items: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
}

function groupByDate(items: ScheduleItem[]): Map<string, ScheduleItem[]> {
  return items.reduce((acc, item) => {
    const existing = acc.get(item.date) ?? [];
    acc.set(item.date, [...existing, item]);
    return acc;
  }, new Map<string, ScheduleItem[]>());
}

function sortedEntries(map: Map<string, ScheduleItem[]>): [string, ScheduleItem[]][] {
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function buildMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
  onMapOpen: (item: ScheduleItem) => void;
}

function ScheduleItemCard({ item, onEdit, onDelete, onMapOpen }: ScheduleItemCardProps) {
  const config = SCHEDULE_CATEGORY_CONFIG[item.category];

  return (
    <div className="flex gap-3 py-3">
      <div className="flex flex-col items-center gap-1 pt-1 min-w-[52px]">
        <span className="text-xs font-medium text-muted-foreground">
          {item.startTime}
        </span>
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.color)} />
        {item.endTime && (
          <span className="text-xs text-muted-foreground">{item.endTime}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm leading-tight">{item.title}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                {config.icon} {config.label}
              </Badge>
            </div>
            {item.titleJa && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.titleJa}</p>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            {item.location && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-blue-500 hover:text-blue-600"
                onClick={() => onMapOpen(item)}
                title="지도 보기"
              >
                <MapPin className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {item.location && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.location}</span>
            {item.locationJa && (
              <span className="text-muted-foreground/60">· {item.locationJa}</span>
            )}
            <a
              href={buildMapsUrl(item.locationJa ?? item.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex-shrink-0"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground" />
            </a>
          </div>
        )}

        {item.transport && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Train className="h-3 w-3 shrink-0" />
            <span>{item.transport}</span>
            {item.transportDuration && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {item.transportDuration}
              </span>
            )}
          </div>
        )}

        {item.memo && (
          <p className="mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            {item.memo}
          </p>
        )}
      </div>
    </div>
  );
}

export function ScheduleList({ items, onEdit, onDelete }: ScheduleListProps) {
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [mapItem, setMapItem] = useState<ScheduleItem | null>(null);

  const grouped = useMemo(() => groupByDate(items), [items]);
  const entries = useMemo(() => sortedEntries(grouped), [grouped]);

  function handleMapOpen(item: ScheduleItem) {
    setMapItem(item);
    setMapDrawerOpen(true);
  }

  const mapPlaces = useMemo(() => {
    if (!mapItem?.location) return [];
    return [
      {
        name: mapItem.location,
        address: mapItem.locationJa,
        time: mapItem.startTime,
      },
    ];
  }, [mapItem]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-3">📅</p>
        <p className="text-muted-foreground text-sm">일정이 없습니다</p>
        <p className="text-muted-foreground text-xs mt-1">+ 버튼으로 일정을 추가하세요</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {entries.map(([date, dayItems]) => {
          const sorted = [...dayItems].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
          return (
            <div key={date}>
              <h3 className="text-sm font-semibold text-foreground mb-1 sticky top-0 bg-background py-1">
                {formatDateKo(date)}
              </h3>
              <Separator className="mb-1" />
              <div className="divide-y divide-border/50">
                {sorted.map((item) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMapOpen={handleMapOpen}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer open={mapDrawerOpen} onOpenChange={setMapDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {mapItem?.location ?? "위치"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[60vh]">
            <ScheduleMap places={mapPlaces} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
