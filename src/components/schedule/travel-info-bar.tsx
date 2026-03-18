"use client";

import { Plane, Hotel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlightInfo, HotelInfo } from "@/hooks/use-trip-config";
import type { ScheduleItem } from "@/types/schedule";

interface FlightBarProps {
  flight: FlightInfo;
  direction: "outbound" | "return";
  onAddToSchedule: (item: ScheduleItem) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function FlightBar({ flight, direction, onAddToSchedule }: FlightBarProps) {
  const isOutbound = direction === "outbound";
  const label = isOutbound ? "가는편" : "오는편";

  function handleAdd() {
    const now = new Date().toISOString();
    const item: ScheduleItem = {
      id: `flight-${direction}-${Date.now()}`,
      date: flight.date,
      startTime: flight.departureTime,
      endTime: flight.arrivalTime,
      title: `${flight.airline} ${flight.flightNumber} ${flight.departureAirport}→${flight.arrivalAirport}`,
      location: isOutbound ? flight.departureAirport : flight.arrivalAirport,
      category: "transport",
      createdAt: now,
      updatedAt: now,
    };
    onAddToSchedule(item);
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
      "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
    )}>
      <Plane className={cn(
        "h-4 w-4 flex-shrink-0 text-blue-600",
        !isOutbound && "rotate-180"
      )} />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-blue-700 dark:text-blue-400 mr-1.5">
          {label}
        </span>
        <span className="text-muted-foreground text-xs">
          {flight.flightNumber}
        </span>
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="text-foreground">
          {flight.departureAirport}→{flight.arrivalAirport}
        </span>
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="text-muted-foreground text-xs">
          {formatDate(flight.date)} {flight.departureTime}-{flight.arrivalTime}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 flex-shrink-0"
        onClick={handleAdd}
      >
        <Plus className="h-3 w-3" />
        일정에 추가
      </Button>
    </div>
  );
}

interface HotelBarProps {
  hotel: HotelInfo;
  onAddToSchedule: (item: ScheduleItem) => void;
}

export function HotelBar({ hotel, onAddToSchedule }: HotelBarProps) {
  function handleAdd() {
    const now = new Date().toISOString();
    const checkInItem: ScheduleItem = {
      id: `hotel-checkin-${Date.now()}`,
      date: hotel.checkIn,
      startTime: "15:00",
      endTime: "16:00",
      title: `${hotel.name} 체크인`,
      titleJa: hotel.nameJa ? `${hotel.nameJa} チェックイン` : undefined,
      location: hotel.name,
      category: "accommodation",
      memo: hotel.address,
      createdAt: now,
      updatedAt: now,
    };
    onAddToSchedule(checkInItem);
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
      "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800"
    )}>
      <Hotel className="h-4 w-4 flex-shrink-0 text-purple-600" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-purple-700 dark:text-purple-400 mr-1.5">
          숙소
        </span>
        <span className="text-foreground">{hotel.name}</span>
        {hotel.nameJa && (
          <span className="text-muted-foreground text-xs ml-1">({hotel.nameJa})</span>
        )}
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="text-muted-foreground text-xs">
          체크인 {formatDate(hotel.checkIn)} ~ 체크아웃 {formatDate(hotel.checkOut)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 flex-shrink-0"
        onClick={handleAdd}
      >
        <Plus className="h-3 w-3" />
        일정에 추가
      </Button>
    </div>
  );
}
