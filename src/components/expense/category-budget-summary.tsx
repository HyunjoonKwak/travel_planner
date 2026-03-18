"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatJPY } from "@/lib/utils/currency";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";
import type { BudgetConfig } from "@/hooks/use-trip-config";

interface CategoryBudgetSummaryProps {
  expenses: Expense[];
  budget: BudgetConfig;
}

export function CategoryBudgetSummary({
  expenses,
  budget,
}: CategoryBudgetSummaryProps) {
  return (
    <Card className="mx-4 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          카테고리 예산 요약
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {(
          Object.entries(EXPENSE_CATEGORY_CONFIG) as [
            ExpenseCategory,
            (typeof EXPENSE_CATEGORY_CONFIG)[ExpenseCategory],
          ][]
        ).map(([key, meta]) => {
          const spent = expenses
            .filter((e) => e.currency === "JPY" && e.category === key)
            .reduce((s, e) => s + e.amount, 0);
          const budgeted = budget.categories[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between text-xs py-1"
            >
              <span>
                {meta.icon} {meta.label}
              </span>
              <span
                className={cn(
                  spent > budgeted
                    ? "text-destructive font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {formatJPY(spent)} / {formatJPY(budgeted)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
