"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripSchedules } from "@/hooks/use-trip-data";
import { formatDateKo } from "@/lib/utils/date";

export function TodaySchedule() {
  const { activeTrip } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const { items, loading } = useTripSchedules(tripId);

  if (!activeTrip || loading) return null;

  const today = new Date().toISOString().slice(0, 10);
  const startDate = activeTrip.startDate ?? today;

  const targetDate = items.some((i) => (i as { date: string }).date === today)
    ? today
    : startDate;

  const dayItems = items
    .filter((i) => (i as { date: string }).date === targetDate)
    .sort((a, b) =>
      ((a as { startTime: string }).startTime ?? "").localeCompare(
        (b as { startTime: string }).startTime ?? "",
      ),
    );

  if (dayItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span>📅</span>
            <span>일정 미리보기</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            등록된 일정이 없습니다. 일정 탭에서 추가하세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📅</span>
          <span>일정 미리보기</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatDateKo(targetDate)}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {dayItems.map((item) => {
            const s = item as {
              id: string;
              startTime: string;
              title: string;
              location?: string;
            };
            return (
              <li
                key={s.id}
                className="flex items-start gap-3 py-1.5 border-b border-dashed border-muted last:border-0"
              >
                <span className="text-xs font-mono text-muted-foreground w-12 shrink-0 pt-0.5">
                  {s.startTime}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {s.title}
                  </p>
                  {s.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📍 {s.location}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
