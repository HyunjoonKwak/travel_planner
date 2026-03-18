import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LearningItem {
  readonly label: string;
  readonly current: number;
  readonly total: number;
  readonly icon: string;
  readonly color: string;
}

const LEARNING_ITEMS: readonly LearningItem[] = [
  {
    label: "히라가나",
    current: 32,
    total: 46,
    icon: "あ",
    color: "[&>div]:bg-violet-500",
  },
  {
    label: "가타카나",
    current: 15,
    total: 46,
    icon: "ア",
    color: "[&>div]:bg-blue-500",
  },
  {
    label: "여행 회화",
    current: 12,
    total: 30,
    icon: "💬",
    color: "[&>div]:bg-amber-500",
  },
];

export function LearnProgress() {
  const totalCurrent = LEARNING_ITEMS.reduce(
    (sum, item) => sum + item.current,
    0,
  );
  const totalItems = LEARNING_ITEMS.reduce((sum, item) => sum + item.total, 0);
  const overallPercent = Math.round((totalCurrent / totalItems) * 100);

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
          {LEARNING_ITEMS.map((item) => {
            const percent = Math.round((item.current / item.total) * 100);
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
