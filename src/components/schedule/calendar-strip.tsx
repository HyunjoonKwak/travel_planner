"use client";

import { cn } from "@/lib/utils";
import type { ScheduleItem } from "@/types/schedule";
import { SCHEDULE_CATEGORY_CONFIG } from "@/types/schedule";

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

interface CalendarDayProps {
  date: string;
  items: ScheduleItem[];
  isSelected: boolean;
  onClick: () => void;
}

function CalendarDay({ date, items, isSelected, onClick }: CalendarDayProps) {
  const day = new Date(date).getDate();
  const dots = items.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      <span className="text-xs font-medium opacity-70">
        {DAYS_KO[new Date(date).getDay()]}
      </span>
      <span className="text-lg font-bold">{day}</span>
      <div className="flex gap-0.5 flex-wrap justify-center min-h-[10px]">
        {dots.map((item) => (
          <div
            key={item.id}
            className={cn(
              "w-2 h-2 rounded-full",
              isSelected
                ? "bg-primary-foreground/70"
                : SCHEDULE_CATEGORY_CONFIG[item.category].color
            )}
          />
        ))}
      </div>
    </button>
  );
}

interface CalendarStripProps {
  dates: string[];
  items: ScheduleItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export function CalendarStrip({ dates, items, selectedDate, onSelectDate }: CalendarStripProps) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${dates.length}, 1fr)` }}>
      {dates.map((date) => {
        const dayItems = items.filter((i) => i.date === date);
        return (
          <CalendarDay
            key={date}
            date={date}
            items={dayItems}
            isSelected={selectedDate === date}
            onClick={() => onSelectDate(selectedDate === date ? null : date)}
          />
        );
      })}
    </div>
  );
}
