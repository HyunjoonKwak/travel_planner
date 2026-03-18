export interface Expense {
  readonly id: string;
  readonly date: string;
  readonly amount: number;
  readonly currency: string;
  readonly category: ExpenseCategory;
  readonly description: string;
  readonly memo?: string;
  readonly receiptImageUrl?: string;
  readonly createdAt: string;
}

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "accommodation"
  | "sightseeing"
  | "other";

export const EXPENSE_CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  food: { label: "식비", icon: "🍽", color: "hsl(var(--chart-1))" },
  transport: { label: "교통", icon: "🚇", color: "hsl(var(--chart-2))" },
  shopping: { label: "쇼핑", icon: "🛍", color: "hsl(var(--chart-3))" },
  accommodation: { label: "숙박", icon: "🏨", color: "hsl(var(--chart-4))" },
  sightseeing: { label: "관광", icon: "🎫", color: "hsl(var(--chart-5))" },
  other: { label: "기타", icon: "📌", color: "hsl(210 10% 60%)" },
};
