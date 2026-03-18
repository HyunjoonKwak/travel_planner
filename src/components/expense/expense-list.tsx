"use client";

import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDateKo } from "@/lib/utils/date";
import { formatJPY, formatKRW, jpyToKrw, krwToJpy } from "@/lib/utils/currency";
import type { Expense } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";

interface ExpenseListProps {
  expenses: Expense[];
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  return expenses.reduce((acc, expense) => {
    const existing = acc.get(expense.date) ?? [];
    acc.set(expense.date, [...existing, expense]);
    return acc;
  }, new Map<string, Expense[]>());
}

function toJpy(expense: Expense): number {
  if (expense.currency === "JPY") return expense.amount;
  return krwToJpy(expense.amount);
}

function getDayTotal(dayExpenses: Expense[]): number {
  return dayExpenses.reduce((sum, e) => sum + toJpy(e), 0);
}

function ExpenseItemRow({ expense }: { expense: Expense }) {
  const config = EXPENSE_CATEGORY_CONFIG[expense.category];
  const isJpy = expense.currency === "JPY";
  const jpyAmount = toJpy(expense);
  const krwAmount = jpyToKrw(jpyAmount);

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 bg-muted"
        aria-label={config.label}
      >
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{expense.description}</p>
          {!isJpy && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
              ₩
            </Badge>
          )}
        </div>
        {expense.memo && (
          <p className="text-xs text-muted-foreground truncate">{expense.memo}</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">
          {isJpy ? formatJPY(expense.amount) : formatKRW(expense.amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isJpy ? formatKRW(krwAmount) : `≈ ${formatJPY(jpyAmount)}`}
        </p>
      </div>
    </div>
  );
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const grouped = useMemo(() => groupByDate(expenses), [expenses]);
  const entries = useMemo(
    () => Array.from(grouped.entries()).sort(([a], [b]) => b.localeCompare(a)),
    [grouped],
  );

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-3">💴</p>
        <p className="text-muted-foreground text-sm">지출 내역이 없습니다</p>
        <p className="text-muted-foreground text-xs mt-1">+ 버튼으로 지출을 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map(([date, dayExpenses]) => {
        const dayTotal = getDayTotal(dayExpenses);
        const sorted = [...dayExpenses].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-1 sticky top-0 bg-background py-1">
              <h3 className="text-sm font-semibold">{formatDateKo(date)}</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {formatJPY(dayTotal)}
              </span>
            </div>
            <Separator className="mb-1" />
            <div className="divide-y divide-border/50">
              {sorted.map((expense) => (
                <ExpenseItemRow key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
