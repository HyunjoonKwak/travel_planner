export interface FoodSpot {
  readonly id: string;
  readonly name: string;
  readonly nameJa: string;
  readonly category: FoodCategory;
  readonly area: string;
  readonly address: string;
  readonly addressJa: string;
  readonly rating: number;
  readonly priceRange: string;
  readonly hours: string;
  readonly closedDay?: string;
  readonly imageUrl?: string;
  readonly mapUrl?: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly award?: string;
  readonly recommendedMenu: ReadonlyArray<{
    readonly name: string;
    readonly nameJa: string;
    readonly price?: string;
  }>;
  readonly orderPhrase?: string;
  readonly orderPhraseReading?: string;
  readonly visited: boolean;
  readonly myRating?: number;
  readonly myReview?: string;
  readonly googleRating?: number;
  readonly googleReviewCount?: number;
  readonly placeId?: string;
}

export type FoodCategory =
  | "ramen"
  | "takoyaki"
  | "okonomiyaki"
  | "kushikatsu"
  | "sushi"
  | "udon"
  | "yakiniku"
  | "cafe"
  | "other";

export const FOOD_CATEGORY_CONFIG: Record<
  FoodCategory,
  { label: string; labelJa: string; icon: string }
> = {
  ramen: { label: "라멘", labelJa: "ラーメン", icon: "🍜" },
  takoyaki: { label: "타코야키", labelJa: "たこ焼き", icon: "🐙" },
  okonomiyaki: {
    label: "오코노미야키",
    labelJa: "お好み焼き",
    icon: "🥞",
  },
  kushikatsu: { label: "쿠시카츠", labelJa: "串カツ", icon: "🍢" },
  sushi: { label: "스시", labelJa: "寿司", icon: "🍣" },
  udon: { label: "우동", labelJa: "うどん", icon: "🍲" },
  yakiniku: { label: "야키니쿠", labelJa: "焼肉", icon: "🥩" },
  cafe: { label: "카페", labelJa: "カフェ", icon: "☕" },
  other: { label: "기타", labelJa: "その他", icon: "🍽" },
};
