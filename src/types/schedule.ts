export interface ScheduleItem {
  readonly id: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly title: string;
  readonly titleJa?: string;
  readonly location?: string;
  readonly locationJa?: string;
  readonly transport?: string;
  readonly transportDuration?: string;
  readonly category: ScheduleCategory;
  readonly memo?: string;
  readonly mapUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ScheduleCategory =
  | "sightseeing"
  | "food"
  | "shopping"
  | "transport"
  | "accommodation"
  | "other";

export const SCHEDULE_CATEGORY_CONFIG: Record<
  ScheduleCategory,
  { label: string; color: string; icon: string }
> = {
  sightseeing: { label: "관광", color: "bg-blue-500", icon: "🏯" },
  food: { label: "식사", color: "bg-orange-500", icon: "🍜" },
  shopping: { label: "쇼핑", color: "bg-pink-500", icon: "🛍" },
  transport: { label: "교통", color: "bg-green-500", icon: "🚇" },
  accommodation: { label: "숙박", color: "bg-purple-500", icon: "🏨" },
  other: { label: "기타", color: "bg-gray-500", icon: "📌" },
};
