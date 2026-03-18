"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTripConfig } from "@/hooks/use-trip-config";
import { getDday } from "@/lib/utils/date";

const FULL_BLOOM_DATE = "2026-03-31";
const BLOOM_START_DATE = "2026-03-20";

function calcBloomPercent(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(BLOOM_START_DATE);
  const fullBloom = new Date(FULL_BLOOM_DATE);
  if (today < start) return 0;
  if (today >= fullBloom) return 100;
  const total = fullBloom.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  return Math.round((elapsed / total) * 100);
}

function getBloomLabel(percent: number): string {
  if (percent >= 100) return "만개 🌸";
  if (percent >= 70) return "거의 만개 🌷";
  if (percent >= 40) return "개화 중 🌱";
  if (percent > 0) return "개화 시작 🌿";
  return "아직 꽃봉오리 🪴";
}

export function SakuraStatusCard() {
  const { config } = useTripConfig();

  // 벚꽃여행 또는 일본 여행이 아니면 표시 안 함
  const isSakuraTheme = config.theme === "벚꽃여행";
  const isJapan = config.country === "JP";
  if (!isSakuraTheme && !isJapan) return null;

  const bloomPercent = calcBloomPercent();
  const bloomLabel = getBloomLabel(bloomPercent);
  const daysToFullBloom = getDday(FULL_BLOOM_DATE);

  return (
    <Card className="border-pink-200 dark:border-pink-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
          <span>🌸</span>
          <span>벚꽃 개화 현황</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">만개 예정일</span>
          <span className="font-semibold text-pink-600 dark:text-pink-400">
            3월 31일
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{bloomLabel}</span>
            <span className="font-medium">{bloomPercent}%</span>
          </div>
          <Progress
            value={bloomPercent}
            className="h-3 [&>div]:bg-pink-400"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {daysToFullBloom > 0
            ? `만개까지 ${daysToFullBloom}일 남았습니다`
            : daysToFullBloom === 0
              ? "오늘 만개 예정입니다! 🌸"
              : "벚꽃이 활짝 피었습니다! 🌸"}
        </p>
      </CardContent>
    </Card>
  );
}
