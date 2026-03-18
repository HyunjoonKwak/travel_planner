"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ALL_HIRAGANA } from "@/lib/data/hiragana";
import { ALL_KATAKANA } from "@/lib/data/katakana";
import { TRAVEL_PHRASES } from "@/lib/data/phrases";

interface LearningItem {
  readonly label: string;
  readonly current: number;
  readonly total: number;
  readonly icon: string;
  readonly color: string;
}

export function LearnProgress() {
  const [completedHiragana] = useLocalStorage<string[]>(
    "completed-hiragana",
    [],
  );
  const [completedKatakana] = useLocalStorage<string[]>(
    "completed-katakana",
    [],
  );
  const [savedPhrases] = useLocalStorage<string[]>("saved-phrases", []);

  const learningItems: readonly LearningItem[] = [
    {
      label: "히라가나",
      current: completedHiragana.length,
      total: ALL_HIRAGANA.length,
      icon: "あ",
      color: "[&>div]:bg-violet-500",
    },
    {
      label: "가타카나",
      current: completedKatakana.length,
      total: ALL_KATAKANA.length,
      icon: "ア",
      color: "[&>div]:bg-blue-500",
    },
    {
      label: "여행 회화",
      current: savedPhrases.length,
      total: TRAVEL_PHRASES.length,
      icon: "💬",
      color: "[&>div]:bg-amber-500",
    },
  ];

  const totalCurrent = learningItems.reduce(
    (sum, item) => sum + item.current,
    0,
  );
  const totalItems = learningItems.reduce((sum, item) => sum + item.total, 0);
  const overallPercent =
    totalItems > 0 ? Math.round((totalCurrent / totalItems) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📚</span>
          <span>학습 진도</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-1">
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {overallPercent}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">전체 달성률</p>
        </div>

        <div className="space-y-3">
          {learningItems.map((item) => {
            const percent =
              item.total > 0
                ? Math.round((item.current / item.total) * 100)
                : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {item.current}/{item.total}
                  </span>
                </div>
                <Progress
                  value={percent}
                  className={`h-2 ${item.color}`}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
