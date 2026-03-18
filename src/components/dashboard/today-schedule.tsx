"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateKo } from "@/lib/utils/date";

interface ScheduleItemData {
  readonly id: string;
  readonly date: string;
  readonly startTime: string;
  readonly title: string;
  readonly location?: string;
}

interface TodayScheduleProps {
  readonly startDate?: string;
}

export function TodaySchedule({ startDate }: TodayScheduleProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📅</span>
          <span>일정 미리보기</span>
        </CardTitle>
        {startDate && (
          <p className="text-xs text-muted-foreground">
            {formatDateKo(startDate)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-4">
          일정 탭에서 일정을 추가하세요
        </p>
      </CardContent>
    </Card>
  );
}
