import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateKo } from "@/lib/utils/date";

interface ScheduleItem {
  readonly time: string;
  readonly title: string;
  readonly location?: string;
}

const SAMPLE_SCHEDULE: readonly ScheduleItem[] = [
  { time: "09:00", title: "나리타 공항 도착", location: "나리타 국제공항" },
  { time: "11:30", title: "아사쿠사 관광", location: "아사쿠사 센소지" },
  { time: "13:00", title: "점심 - 라멘", location: "이치란 라멘" },
  { time: "15:00", title: "우에노 공원 벚꽃 구경", location: "우에노 공원" },
  { time: "18:30", title: "숙소 체크인", location: "시부야 호텔" },
  { time: "20:00", title: "이자카야 저녁", location: "신주쿠 골든가이" },
];

const SCHEDULE_DATE = "2026-04-01";

export function TodaySchedule() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📅</span>
          <span>일정 미리보기</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatDateKo(SCHEDULE_DATE)} 샘플
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {SAMPLE_SCHEDULE.map((item) => (
            <li
              key={`${item.time}-${item.title}`}
              className="flex items-start gap-3 py-1.5 border-b border-dashed border-muted last:border-0"
            >
              <span className="text-xs font-mono text-muted-foreground w-12 shrink-0 pt-0.5">
                {item.time}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                {item.location && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    📍 {item.location}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
