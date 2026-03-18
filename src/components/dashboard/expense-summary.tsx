"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripExpenses } from "@/hooks/use-trip-data";
import {
  formatCurrency,
  getCurrencyForCountry,
} from "@/lib/utils/currency";

interface BudgetConfig {
  readonly totalBudget: number;
  readonly categories?: Record<string, number>;
}

function parseBudget(raw: string | null | undefined): BudgetConfig | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BudgetConfig;
  } catch {
    return null;
  }
}

export function ExpenseSummary() {
  const { activeTrip } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const { items, loading } = useTripExpenses(tripId);

  const budget = parseBudget(activeTrip?.budget);
  const countryCode = activeTrip?.country ?? "JP";
  const localCurrency = getCurrencyForCountry(countryCode);

  const totalSpent = useMemo(
    () => items.reduce((sum, e) => sum + ((e as { amount: number }).amount ?? 0), 0),
    [items],
  );

  if (!activeTrip || loading) return null;

  const totalBudget = budget?.totalBudget ?? 0;
  const usedPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>💰</span>
          <span>지출 현황</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {totalBudget > 0 ? (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">사용</span>
                <span className="font-semibold">
                  {formatCurrency(totalSpent, localCurrency.code)}
                </span>
              </div>
              <Progress
                value={Math.min(usedPercent, 100)}
                className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500"}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usedPercent}% 사용</span>
                <span>
                  예산 {formatCurrency(totalBudget, localCurrency.code)}
                </span>
              </div>
            </div>
            <div
              className={`text-center text-sm font-medium ${isOverBudget ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {isOverBudget
                ? `예산 초과 ${formatCurrency(Math.abs(remaining), localCurrency.code)}`
                : `잔여 ${formatCurrency(remaining, localCurrency.code)}`}
            </div>
          </>
        ) : items.length > 0 ? (
          <div className="text-center">
            <p className="text-sm font-semibold">
              {formatCurrency(totalSpent, localCurrency.code)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.length}건 지출 (예산 미설정)
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            가계부에서 지출을 기록하세요
          </p>
        )}
      </CardContent>
    </Card>
  );
}
