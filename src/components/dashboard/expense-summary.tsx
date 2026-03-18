import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatJPY } from "@/lib/utils/currency";

const BUDGET = 100_000;
const SPENT = 45_000;

interface ExpenseCategory {
  readonly label: string;
  readonly amount: number;
  readonly icon: string;
}

const CATEGORIES: readonly ExpenseCategory[] = [
  { label: "교통", amount: 15_000, icon: "🚆" },
  { label: "식비", amount: 18_000, icon: "🍜" },
  { label: "관광", amount: 8_000, icon: "🎌" },
  { label: "쇼핑", amount: 4_000, icon: "🛍️" },
];

export function ExpenseSummary() {
  const usedPercent = Math.round((SPENT / BUDGET) * 100);
  const remaining = BUDGET - SPENT;
  const isOverBudget = remaining < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>💴</span>
          <span>지출 현황</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">사용</span>
            <span className="font-semibold">{formatJPY(SPENT)}</span>
          </div>
          <Progress
            value={usedPercent}
            className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500"}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usedPercent}% 사용</span>
            <span>예산 {formatJPY(BUDGET)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50"
            >
              <span className="text-base">{cat.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{cat.label}</p>
                <p className="text-xs font-medium">{formatJPY(cat.amount)}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center text-sm font-medium ${isOverBudget ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {isOverBudget
            ? `예산 초과 ${formatJPY(Math.abs(remaining))}`
            : `잔여 예산 ${formatJPY(remaining)}`}
        </div>
      </CardContent>
    </Card>
  );
}
