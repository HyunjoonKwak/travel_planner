"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { getCurrencyForCountry } from "@/lib/utils/currency";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripExpenses } from "@/hooks/use-trip-data";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ExpenseList } from "@/components/expense/expense-list";
import { CategoryBudgetSummary } from "@/components/expense/category-budget-summary";
import {
  BudgetBar,
  NoBudgetPrompt,
  DailySummaryItem,
  CategorySummaryItem,
  toLocalAmount,
} from "@/components/expense/expense-summary-items";
import type { Expense, ExpenseCategory } from "@/types/expense";
import type { BudgetConfig } from "@/hooks/use-trip-config";
import { NoTripPrompt } from "@/components/common/no-trip-prompt";

function parseCountryCode(country: string | null | undefined): string {
  if (!country) return "JP";
  return country.trim().toUpperCase().slice(0, 2);
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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const expenses = dbItems as unknown as Expense[];

  const countryCode = parseCountryCode(activeTrip?.country);
  const localCurrencyInfo = getCurrencyForCountry(countryCode);
  const localCode = localCurrencyInfo.code;

  const budget = parseTripJson<BudgetConfig>(activeTrip?.budget);
  const totalBudget = budget?.totalBudget ?? 0;

  const totalSpentLocal = useMemo(
    () => expenses.reduce((sum, e) => sum + toLocalAmount(e, localCode), 0),
    [expenses, localCode],
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
      const totalA = a.reduce((s, x) => s + toLocalAmount(x, localCode), 0);
      const totalB = b.reduce((s, x) => s + toLocalAmount(x, localCode), 0);
      return totalB - totalA;
    });
  }, [expenses, localCode]);

  async function handleAddExpense(expense: Expense) {
    try {
      await create(expense);
      setDrawerOpen(false);
    } catch {
      toast.error("지출 추가에 실패했습니다. 다시 시도해주세요.");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    try {
      await remove(deleteTargetId);
    } catch {
      toast.error("지출 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleteTargetId(null);
    }
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
        <BudgetBar spent={totalSpentLocal} budget={totalBudget} localCode={localCode} />
      ) : (
        <NoBudgetPrompt />
      )}

      <Tabs defaultValue="all" className="px-0">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
            <TabsTrigger value="daily" className="flex-1">일별</TabsTrigger>
            <TabsTrigger value="category" className="flex-1">카테고리</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0 px-4 py-4">
          {expenseLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <ExpenseList
              expenses={expenses}
              localCurrencyCode={localCode}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          )}
        </TabsContent>

        <TabsContent value="daily" className="mt-0">
          <Card className="mx-4 my-4">
            {expenseLoading ? (
              <div className="p-4"><Skeleton className="h-24 w-full" /></div>
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
              <div className="p-4"><Skeleton className="h-24 w-full" /></div>
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
                    totalSpentLocal={totalSpentLocal}
                    budgetAmount={budget?.categories[category]}
                    localCode={localCode}
                  />
                ))}
              </div>
            )}
          </Card>
          {budget && groupedByCategory.length > 0 && (
            <CategoryBudgetSummary
              expenses={expenses}
              budget={budget}
              localCode={localCode}
            />
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

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지출 삭제</DialogTitle>
            <DialogDescription>
              이 지출 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
