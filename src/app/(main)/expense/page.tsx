"use client";

import { useState, useMemo } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  convertToKRW,
  getCurrencyForCountry,
  getCurrencyInfo,
} from "@/lib/utils/currency";
import { formatDateKo } from "@/lib/utils/date";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripExpenses } from "@/hooks/use-trip-data";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ExpenseList } from "@/components/expense/expense-list";
import { CategoryBudgetSummary } from "@/components/expense/category-budget-summary";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";
import type { BudgetConfig } from "@/hooks/use-trip-config";
import Link from "next/link";
import { NoTripPrompt } from "@/components/common/no-trip-prompt";

const DEFAULT_RATE = 8.9;

function parseCountryCode(country: string | null | undefined): string {
  if (!country) return "JP";
  return country.trim().toUpperCase().slice(0, 2);
}

function toKRW(expense: Expense): number {
  if (expense.currency === "KRW") return expense.amount;
  return convertToKRW(expense.amount, expense.currency, DEFAULT_RATE);
}

interface BudgetBarProps {
  spent: number;
  budget: number;
  localCode: string;
}

function BudgetBar({ spent, budget, localCode }: BudgetBarProps) {
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

function NoBudgetPrompt() {
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

function DailySummaryItem({ date, expenses, localCode }: DailySummaryItemProps) {
  const totalKRW = expenses.reduce((sum, e) => sum + toKRW(e), 0);

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm">{formatDateKo(date)}</span>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {formatCurrency(totalKRW, "KRW")}
        </p>
      </div>
    </div>
  );
}

interface CategorySummaryItemProps {
  category: ExpenseCategory;
  expenses: Expense[];
  totalSpentKRW: number;
  budgetAmount?: number;
  localCode: string;
}

function CategorySummaryItem({
  category,
  expenses,
  totalSpentKRW,
  budgetAmount,
  localCode,
}: CategorySummaryItemProps) {
  const config = EXPENSE_CATEGORY_CONFIG[category];
  const categoryTotalKRW = expenses.reduce((sum, e) => sum + toKRW(e), 0);
  const percent =
    budgetAmount && budgetAmount > 0
      ? Math.min((categoryTotalKRW / budgetAmount) * 100, 100)
      : totalSpentKRW > 0
        ? (categoryTotalKRW / totalSpentKRW) * 100
        : 0;
  const isOver = budgetAmount ? categoryTotalKRW > budgetAmount : false;

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
              {formatCurrency(categoryTotalKRW, localCode)}
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
              ? `${formatCurrency(categoryTotalKRW - budgetAmount, localCode)} 초과`
              : `${percent.toFixed(1)}% 사용`
            : `${percent.toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}

function parseTripJson<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export default function ExpensePage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const {
    items: dbItems,
    create,
    remove,
    loading: expenseLoading,
  } = useTripExpenses(tripId);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const expenses = dbItems as unknown as Expense[];

  const countryCode = parseCountryCode(activeTrip?.country);
  const localCurrencyInfo = getCurrencyForCountry(countryCode);
  const localCode = localCurrencyInfo.code;

  const budget = parseTripJson<BudgetConfig>(activeTrip?.budget);
  const totalBudget = budget?.totalBudget ?? 0;

  const totalSpentKRW = useMemo(
    () => expenses.reduce((sum, e) => sum + toKRW(e), 0),
    [expenses],
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Expense[]>();
    expenses.forEach((e) => {
      const existing = map.get(e.date) ?? [];
      map.set(e.date, [...existing, e]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, Expense[]>();
    expenses.forEach((e) => {
      const existing = map.get(e.category) ?? [];
      map.set(e.category, [...existing, e]);
    });
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const totalA = a.reduce((s, x) => s + toKRW(x), 0);
      const totalB = b.reduce((s, x) => s + toKRW(x), 0);
      return totalB - totalA;
    });
  }, [expenses]);

  async function handleAddExpense(expense: Expense) {
    await create(expense);
    setDrawerOpen(false);
  }

  async function handleDeleteExpense(id: string) {
    await remove(id);
  }

  if (tripLoading) {
    return (
      <div className="px-4 py-6 space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!activeTrip) {
    return <NoTripPrompt />;
  }

  return (
    <div className="relative min-h-screen pb-20">
      {totalBudget > 0 ? (
        <BudgetBar spent={totalSpentKRW} budget={totalBudget} localCode={localCode} />
      ) : (
        <NoBudgetPrompt />
      )}

      <Tabs defaultValue="all" className="px-0">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              전체
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex-1">
              일별
            </TabsTrigger>
            <TabsTrigger value="category" className="flex-1">
              카테고리
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0 px-4 py-4">
          {expenseLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <ExpenseList
              expenses={expenses}
              localCurrencyCode={localCode}
              onDelete={handleDeleteExpense}
            />
          )}
        </TabsContent>

        <TabsContent value="daily" className="mt-0">
          <Card className="mx-4 my-4">
            {expenseLoading ? (
              <div className="p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : groupedByDate.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                일별 내역이 없습니다
              </div>
            ) : (
              <div className="px-4">
                {groupedByDate.map(([date, dayExpenses]) => (
                  <DailySummaryItem
                    key={date}
                    date={date}
                    expenses={dayExpenses}
                    localCode={localCode}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="category" className="mt-0">
          <Card className="mx-4 my-4">
            {expenseLoading ? (
              <div className="p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : groupedByCategory.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                카테고리 내역이 없습니다
              </div>
            ) : (
              <div className="px-4">
                {groupedByCategory.map(([category, catExpenses]) => (
                  <CategorySummaryItem
                    key={category}
                    category={category}
                    expenses={catExpenses}
                    totalSpentKRW={totalSpentKRW}
                    budgetAmount={budget?.categories[category]}
                    localCode={localCode}
                  />
                ))}
              </div>
            )}
          </Card>
          {budget && groupedByCategory.length > 0 && (
            <CategoryBudgetSummary expenses={expenses} budget={budget} />
          )}
        </TabsContent>
      </Tabs>

      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
        onClick={() => setDrawerOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>지출 추가</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
