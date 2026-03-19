"use client";

import { PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, convertCurrency } from "@/lib/utils/currency";
import { formatDateKo } from "@/lib/utils/date";
import Link from "next/link";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";

// Convert any expense amount to local currency amount
export function toLocalAmount(expense: Expense, localCode: string): number {
  if (expense.currency === localCode) return expense.amount;
  return convertCurrency(expense.amount, expense.currency, localCode);
}

interface BudgetBarProps {
  spent: number;
  budget: number;
  localCode: string;
}

export function BudgetBar({ spent, budget, localCode }: BudgetBarProps) {
  const percent = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const isOver = spent > budget;

  return (
    <div className="bg-card border rounded-xl p-4 mx-4 my-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">총 예산</span>
        <span className="text-sm font-bold">
          {formatCurrency(budget, localCode)}
        </span>
      </div>
      <Progress
        value={percent}
        className={cn("h-3 mb-2", isOver && "[&>div]:bg-destructive")}
      />
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground">사용: </span>
          <span className="font-semibold">{formatCurrency(spent, localCode)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">
            {isOver ? "초과: " : "잔액: "}
          </span>
          <span
            className={cn(
              "font-semibold",
              isOver ? "text-destructive" : "text-green-600",
            )}
          >
            {formatCurrency(Math.abs(remaining), localCode)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NoBudgetPrompt() {
  return (
    <div className="mx-4 my-3">
      <Card className="border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          <PiggyBank className="h-8 w-8 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">예산이 설정되지 않았습니다</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              설정에서 예산을 입력하면 지출 현황을 한눈에 볼 수 있어요
            </p>
          </div>
          <Link href="/settings">
            <Button size="sm" variant="outline" className="shrink-0">
              설정하기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

interface DailySummaryItemProps {
  date: string;
  expenses: Expense[];
  localCode: string;
}

export function DailySummaryItem({ date, expenses, localCode }: DailySummaryItemProps) {
  const totalLocal = expenses.reduce((sum, e) => sum + toLocalAmount(e, localCode), 0);

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm">{formatDateKo(date)}</span>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {formatCurrency(totalLocal, localCode)}
        </p>
      </div>
    </div>
  );
}

interface CategorySummaryItemProps {
  category: ExpenseCategory;
  expenses: Expense[];
  totalSpentLocal: number;
  budgetAmount?: number;
  localCode: string;
}

export function CategorySummaryItem({
  category,
  expenses,
  totalSpentLocal,
  budgetAmount,
  localCode,
}: CategorySummaryItemProps) {
  const config = EXPENSE_CATEGORY_CONFIG[category];
  const categoryTotalLocal = expenses.reduce((sum, e) => sum + toLocalAmount(e, localCode), 0);
  const percent =
    budgetAmount && budgetAmount > 0
      ? Math.min((categoryTotalLocal / budgetAmount) * 100, 100)
      : totalSpentLocal > 0
        ? (categoryTotalLocal / totalSpentLocal) * 100
        : 0;
  const isOver = budgetAmount ? categoryTotalLocal > budgetAmount : false;

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-muted shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{config.label}</span>
          <div className="text-right">
            <span className="text-sm font-semibold">
              {formatCurrency(categoryTotalLocal, localCode)}
            </span>
            {budgetAmount !== undefined && budgetAmount > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                / {formatCurrency(budgetAmount, localCode)}
              </span>
            )}
          </div>
        </div>
        <Progress
          value={percent}
          className={cn("h-1.5", isOver && "[&>div]:bg-destructive")}
        />
        <p className="text-xs text-muted-foreground mt-0.5">
          {budgetAmount && budgetAmount > 0
            ? isOver
              ? `${formatCurrency(categoryTotalLocal - budgetAmount, localCode)} 초과`
              : `${percent.toFixed(1)}% 사용`
            : `${percent.toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}
