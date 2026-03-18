export interface FoodSpot {
  readonly id: string;
  readonly name: string;
  readonly nameJa: string;
  readonly nameLocal?: string;
  readonly category: FoodCategory;
  readonly area: string;
  readonly address: string;
  readonly addressJa: string;
  readonly addressLocal?: string;
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
  | "noodles"
  | "rice"
  | "street_food"
  | "seafood"
  | "bbq"
  | "soup"
  | "cafe"
  | "fine_dining"
  | "local"
  | "other";

export const FOOD_CATEGORY_CONFIG: Record<
  FoodCategory,
  { label: string; labelJa: string; icon: string }
> = {
  noodles: { label: "면 요리", labelJa: "麺料理", icon: "🍜" },
  rice: { label: "밥 요리", labelJa: "ご飯料理", icon: "🍚" },
  street_food: { label: "길거리 음식", labelJa: "屋台・B級", icon: "🥡" },
  seafood: { label: "해산물", labelJa: "海鮮", icon: "🍣" },
  bbq: { label: "구이", labelJa: "焼肉・BBQ", icon: "🥩" },
  soup: { label: "국물 요리", labelJa: "スープ", icon: "🍲" },
  cafe: { label: "카페", labelJa: "カフェ", icon: "☕" },
  fine_dining: { label: "파인다이닝", labelJa: "高級", icon: "🌟" },
  local: { label: "현지 맛집", labelJa: "ご当地", icon: "🏮" },
  other: { label: "기타", labelJa: "その他", icon: "🍽" },
};

/**
 * FoodSpot variant that accepts legacy Japanese-specific category names.
 * Used only for existing static data files (osaka, kyoto).
 */
export type LegacyFoodSpot = Omit<FoodSpot, "category"> & { category: LegacyFoodCategory };

/**
 * Legacy category type for backward compatibility with existing static data
 * (osaka, kyoto food spots that use Japanese-specific category names).
 */
export type LegacyFoodCategory =
  | "ramen"
  | "takoyaki"
  | "okonomiyaki"
  | "kushikatsu"
  | "sushi"
  | "udon"
  | "yakiniku"
  | "cafe"
  | "other";

/**
 * Legacy category aliases for backward compatibility with existing static data.
 * Old Japanese-specific categories are remapped to the universal taxonomy.
 */
export const LEGACY_CATEGORY_MAP: Record<LegacyFoodCategory, FoodCategory> = {
  ramen: "noodles",
  udon: "noodles",
  sushi: "seafood",
  yakiniku: "bbq",
  takoyaki: "street_food",
  okonomiyaki: "street_food",
  kushikatsu: "street_food",
  cafe: "cafe",
  other: "other",
};
