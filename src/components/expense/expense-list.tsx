"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateKo } from "@/lib/utils/date";
import {
  formatCurrency,
  convertToKRW,
  getCurrencyInfo,
} from "@/lib/utils/currency";
import type { Expense } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";

const DEFAULT_RATE = 8.9;

interface ExpenseListProps {
  expenses: Expense[];
  localCurrencyCode?: string;
  onDelete?: (id: string) => void;
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  return expenses.reduce((acc, expense) => {
    const existing = acc.get(expense.date) ?? [];
    acc.set(expense.date, [...existing, expense]);
    return acc;
  }, new Map<string, Expense[]>());
}

function toKRW(expense: Expense): number {
  if (expense.currency === "KRW") return expense.amount;
  return convertToKRW(expense.amount, expense.currency, DEFAULT_RATE);
}

function getDayTotalKRW(dayExpenses: Expense[]): number {
  return dayExpenses.reduce((sum, e) => sum + toKRW(e), 0);
}

function ExpenseItemRow({
  expense,
  localCurrencyCode = "JPY",
  onDelete,
}: {
  expense: Expense;
  localCurrencyCode?: string;
  onDelete?: (id: string) => void;
}) {
  const config = EXPENSE_CATEGORY_CONFIG[expense.category];
  const isKRW = expense.currency === "KRW";
  const krwAmount = toKRW(expense);

  const currencyInfo = getCurrencyInfo(expense.currency);
  const isLocal = expense.currency === localCurrencyCode;

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
          {!isLocal && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
              {currencyInfo.symbol}
            </Badge>
          )}
        </div>
        {expense.memo && (
          <p className="text-xs text-muted-foreground truncate">
            {expense.memo}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">
          {formatCurrency(expense.amount, expense.currency)}
        </p>
        {!isKRW && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(krwAmount, "KRW")}
          </p>
        )}
      </div>

      {onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(expense.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function ExpenseList({
  expenses,
  localCurrencyCode = "JPY",
  onDelete,
}: ExpenseListProps) {
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
        <p className="text-muted-foreground text-xs mt-1">
          + 버튼으로 지출을 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map(([date, dayExpenses]) => {
        const dayTotalKRW = getDayTotalKRW(dayExpenses);
        const sorted = [...dayExpenses].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-1 sticky top-0 bg-background py-1">
              <h3 className="text-sm font-semibold">{formatDateKo(date)}</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {formatCurrency(dayTotalKRW, "KRW")}
              </span>
            </div>
            <Separator className="mb-1" />
            <div className="divide-y divide-border/50">
              {sorted.map((expense) => (
                <ExpenseItemRow
                  key={expense.id}
                  expense={expense}
                  localCurrencyCode={localCurrencyCode}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
