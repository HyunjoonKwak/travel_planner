"use client";

import { useState } from "react";
import { Wallet, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BudgetConfig } from "@/hooks/use-trip-config";
import { formatJPY, formatKRW, jpyToKrw, krwToJpy } from "@/lib/utils/currency";
import { toast } from "sonner";

interface CategoryRowProps {
  label: string;
  icon: string;
  valueJpy: number;
  total: number;
  inputCurrency: "JPY" | "KRW";
  onChange: (jpyValue: number) => void;
}

function CategoryRow({
  label,
  icon,
  valueJpy,
  total,
  inputCurrency,
  onChange,
}: CategoryRowProps) {
  const percent = total > 0 ? Math.min((valueJpy / total) * 100, 100) : 0;
  const displayValue =
    inputCurrency === "JPY" ? valueJpy : jpyToKrw(valueJpy);

  function handleChange(v: number) {
    const jpyVal = inputCurrency === "JPY" ? v : krwToJpy(v);
    onChange(jpyVal);
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {inputCurrency === "JPY" ? "¥" : "₩"}
          </span>
          <Input
            type="number"
            className="w-28 h-7 text-right text-xs"
            value={displayValue || ""}
            onChange={(e) => handleChange(Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>
      <Progress value={percent} className="h-1.5" />
    </div>
  );
}

const DEFAULT_RATIOS = {
  food: 0.4,
  transport: 0.15,
  shopping: 0.2,
  accommodation: 0.1,
  sightseeing: 0.1,
  other: 0.05,
};

const CATEGORY_META = [
  { key: "food" as const, label: "식비", icon: "🍽" },
  { key: "transport" as const, label: "교통", icon: "🚇" },
  { key: "shopping" as const, label: "쇼핑", icon: "🛍" },
  { key: "accommodation" as const, label: "숙박", icon: "🏨" },
  { key: "sightseeing" as const, label: "관광", icon: "🎫" },
  { key: "other" as const, label: "기타", icon: "📌" },
];

interface BudgetCardProps {
  budget: BudgetConfig | undefined;
  onSave: (budget: BudgetConfig) => void;
}

export function BudgetCard({ budget, onSave }: BudgetCardProps) {
  const [inputCurrency, setInputCurrency] = useState<"JPY" | "KRW">("JPY");
  const [totalJpy, setTotalJpy] = useState(budget?.totalBudget ?? 0);
  const [categories, setCategories] = useState(
    budget?.categories ?? {
      food: 0,
      transport: 0,
      shopping: 0,
      accommodation: 0,
      sightseeing: 0,
      other: 0,
    },
  );

  const displayTotal =
    inputCurrency === "JPY" ? totalJpy : jpyToKrw(totalJpy);
  const convertedTotal =
    inputCurrency === "JPY" ? jpyToKrw(totalJpy) : totalJpy;
  const convertedSymbol = inputCurrency === "JPY" ? "₩" : "¥";
  const inputSymbol = inputCurrency === "JPY" ? "¥" : "₩";

  function handleTotalChange(value: number) {
    const jpyVal = inputCurrency === "JPY" ? value : krwToJpy(value);
    setTotalJpy(jpyVal);
    if (jpyVal > 0) {
      setCategories({
        food: Math.round(jpyVal * DEFAULT_RATIOS.food),
        transport: Math.round(jpyVal * DEFAULT_RATIOS.transport),
        shopping: Math.round(jpyVal * DEFAULT_RATIOS.shopping),
        accommodation: Math.round(jpyVal * DEFAULT_RATIOS.accommodation),
        sightseeing: Math.round(jpyVal * DEFAULT_RATIOS.sightseeing),
        other: Math.round(jpyVal * DEFAULT_RATIOS.other),
      });
    }
  }

  function handleCategoryChange(
    key: keyof typeof categories,
    jpyValue: number,
  ) {
    setCategories((prev) => ({ ...prev, [key]: jpyValue }));
  }

  function toggleCurrency() {
    setInputCurrency((prev) => (prev === "JPY" ? "KRW" : "JPY"));
  }

  function handleSave() {
    if (!totalJpy || totalJpy <= 0) {
      toast.error("총 예산을 입력해주세요");
      return;
    }
    onSave({ totalBudget: totalJpy, categories });
    toast.success("예산이 저장되었습니다");
  }

  const allocated = Object.values(categories).reduce((a, b) => a + b, 0);
  const unallocatedJpy = totalJpy - allocated;
  const unallocatedDisplay =
    inputCurrency === "JPY" ? unallocatedJpy : jpyToKrw(unallocatedJpy);

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4 text-green-600" />
          여행 예산
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="budget-total">총 예산</Label>
            <button
              type="button"
              onClick={toggleCurrency}
              className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors rounded-full border border-green-300 px-2.5 py-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              {inputCurrency === "JPY" ? "엔화 (JPY)" : "원화 (KRW)"}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {inputSymbol}
            </span>
            <Input
              id="budget-total"
              type="number"
              placeholder={inputCurrency === "JPY" ? "예: 300000" : "예: 2670000"}
              value={displayTotal || ""}
              onChange={(e) =>
                handleTotalChange(Number(e.target.value) || 0)
              }
              className="pl-7"
            />
          </div>
          {totalJpy > 0 && (
            <p className="text-xs text-muted-foreground">
              ≈ {convertedSymbol}
              {convertedTotal.toLocaleString()}
              <span className="ml-2 text-muted-foreground/60">(1¥ ≈ ₩8.9)</span>
            </p>
          )}
        </div>

        {totalJpy > 0 && (
          <div className="space-y-3">
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                카테고리별 예산 배분 ({inputSymbol})
              </p>
              <div className="space-y-3">
                {CATEGORY_META.map(({ key, label, icon }) => (
                  <CategoryRow
                    key={key}
                    label={label}
                    icon={icon}
                    valueJpy={categories[key]}
                    total={totalJpy}
                    inputCurrency={inputCurrency}
                    onChange={(v) => handleCategoryChange(key, v)}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">미배분</span>
              <span
                className={
                  unallocatedJpy < 0
                    ? "text-xs font-semibold text-destructive"
                    : "text-xs font-semibold text-green-600"
                }
              >
                {inputSymbol}{unallocatedDisplay.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <Button className="w-full" onClick={handleSave}>
          저장
        </Button>
      </CardContent>
    </Card>
  );
}
