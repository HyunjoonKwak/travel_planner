"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  convertToKRW,
  convertFromKRW,
  getCurrencyForCountry,
  getCurrencyInfo,
} from "@/lib/utils/currency";
import { generateId } from "@/lib/utils/date";
import { useActiveTrip } from "@/hooks/use-trip";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORY_CONFIG } from "@/types/expense";

const DEFAULT_RATE = 8.9;

const expenseSchema = z.object({
  amount: z
    .number({ message: "금액을 입력하세요" })
    .positive("0보다 큰 금액을 입력하세요")
    .max(100_000_000, "금액이 너무 큽니다"),
  category: z.enum([
    "food",
    "transport",
    "shopping",
    "accommodation",
    "sightseeing",
    "other",
  ] as const),
  description: z.string().min(1, "내용을 입력하세요").max(100),
  date: z.string().min(1, "날짜를 선택하세요"),
  memo: z.string().max(300).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_CONFIG) as [
  ExpenseCategory,
  (typeof EXPENSE_CATEGORY_CONFIG)[ExpenseCategory],
][];

const TODAY = new Date().toISOString().slice(0, 10);

function parseCountryCode(country: string | null | undefined): string {
  if (!country) return "JP";
  // country may be stored as country code like "JP", "TH", etc.
  return country.trim().toUpperCase().slice(0, 2);
}

export function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const { activeTrip } = useActiveTrip();
  const countryCode = parseCountryCode(activeTrip?.country);
  const localCurrency = getCurrencyForCountry(countryCode);
  const krwCurrency = getCurrencyInfo("KRW");

  const [currencyCode, setCurrencyCode] = useState<string>(localCurrency.code);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: undefined,
      category: "food",
      description: "",
      date: TODAY,
      memo: "",
    },
  });

  const amountValue = watch("amount");
  const categoryValue = watch("category");

  const isLocalCurrency = currencyCode !== "KRW";

  const convertedAmount =
    amountValue > 0
      ? isLocalCurrency
        ? convertToKRW(amountValue, currencyCode, DEFAULT_RATE)
        : convertFromKRW(amountValue, localCurrency.code, DEFAULT_RATE)
      : 0;

  const convertedLabel =
    amountValue > 0
      ? isLocalCurrency
        ? `약 ${formatCurrency(convertedAmount, "KRW")}`
        : `약 ${formatCurrency(convertedAmount, localCurrency.code)}`
      : "";

  function toggleCurrency() {
    if (amountValue > 0) {
      const converted = isLocalCurrency
        ? convertToKRW(amountValue, currencyCode, DEFAULT_RATE)
        : convertFromKRW(amountValue, localCurrency.code, DEFAULT_RATE);
      setValue("amount", converted, { shouldValidate: true });
    }
    setCurrencyCode((prev) => (prev === "KRW" ? localCurrency.code : "KRW"));
  }

  function handleFormSubmit(values: ExpenseFormValues) {
    const now = new Date().toISOString();
    const expense: Expense = {
      id: generateId(),
      date: values.date,
      amount: values.amount,
      currency: currencyCode,
      category: values.category,
      description: values.description,
      memo: values.memo || undefined,
      createdAt: now,
    };
    onSubmit(expense);
  }

  const activeCurrencyInfo = getCurrencyInfo(currencyCode);
  const currencyLabel = isLocalCurrency
    ? `${localCurrency.name} (${localCurrency.code})`
    : `원화 (KRW)`;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Currency toggle + Amount */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="amount">금액 *</Label>
          {localCurrency.code !== "KRW" && (
            <button
              type="button"
              onClick={toggleCurrency}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-full border border-primary/30 px-2.5 py-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              {currencyLabel}
            </button>
          )}
        </div>

        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {activeCurrencyInfo.symbol}
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                placeholder="0"
                className={cn("pl-7", errors.amount && "border-destructive")}
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            <FieldError message={errors.amount?.message} />
          </div>
        </div>

        {convertedAmount > 0 && convertedLabel && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{convertedLabel}</span>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">카테고리 *</Label>
        <Select
          value={categoryValue}
          onValueChange={(val) =>
            setValue("category", val as ExpenseCategory, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className={cn(errors.category && "border-destructive")}>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.icon} {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.category?.message} />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">내용 *</Label>
        <Input
          id="description"
          placeholder="예: 라멘 점심"
          className={cn(errors.description && "border-destructive")}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">날짜 *</Label>
        <Input
          id="date"
          type="date"
          className={cn(errors.date && "border-destructive")}
          {...register("date")}
        />
        <FieldError message={errors.date?.message} />
      </div>

      {/* Memo */}
      <div>
        <Label htmlFor="memo">메모</Label>
        <Textarea
          id="memo"
          placeholder="추가 메모"
          rows={2}
          {...register("memo")}
        />
        <FieldError message={errors.memo?.message} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          추가
        </Button>
      </div>
    </form>
  );
}
